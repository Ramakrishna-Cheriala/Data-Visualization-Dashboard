import fs from "fs";
import csv from "fast-csv";

// let filePath = "";

export const uploadFileController = async (req, res) => {
  // filePath = req.file.path;
  try {
    if (!req.file || !req.file.path.endsWith(".csv")) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid file format" });
    }

    let rowCount = 0;
    let columnCount = 0;
    let totalMissingValues = 0;
    let chunkRowCount = 0;
    const columnInfo = {};

    // Function to process each chunk
    const processChunk = (chunk) => {
      chunk.forEach((row) => {
        chunkRowCount++;
        // Store information about data types and missing values for each column
        if (chunkRowCount === 1) {
          // Extract column names from the first row
          Object.keys(row).forEach((columnName) => {
            columnInfo[columnName] = {
              boolean: false,
              integer: false,
              float: false,
              string: false,
              date: false,
              missingValues: 0,
            };
            columnCount++;
          });
        } else {
          // Update column information based on subsequent rows
          Object.entries(row).forEach(([columnName, value]) => {
            if (value === null || value === "") {
              totalMissingValues++;
              columnInfo[columnName].missingValues++;
            } else {
              if (value === true || value === false) {
                columnInfo[columnName].boolean = true;
              } else if (
                !isNaN(value) &&
                parseInt(value, 10) === parseFloat(value)
              ) {
                // Check for integer (avoid floating point representation)
                columnInfo[columnName].integer = true;
              } else if (!isNaN(value)) {
                columnInfo[columnName].float = true;
              } else if (value instanceof Date && !isNaN(value.getTime())) {
                // Check for valid Date object
                columnInfo[columnName].date = true;
              } else {
                columnInfo[columnName].string = true;
              }
            }
          });
        }
      });
    };

    // Create a read stream for the CSV file
    const stream = fs.createReadStream(req.file.path);

    // Initialize the chunk counter
    let chunkCounter = 0;
    let currentChunk = [];

    // Parse the CSV file in chunks
    csv
      .parseStream(stream, { headers: true })
      .on("data", (row) => {
        // Add row to the current chunk
        currentChunk.push(row);
        rowCount++;

        // If the current chunk reaches 1000 rows, process it and reset the chunk
        if (currentChunk.length === 1000) {
          processChunk(currentChunk);
          currentChunk = [];
          // Increment the chunk counter
          chunkCounter++;
          console.log(`Processed chunk ${chunkCounter}`);
        }
      })
      .on("end", () => {
        // Process the remaining rows (if any) in the last chunk
        if (currentChunk.length > 0) {
          processChunk(currentChunk);
        }

        // Send response with analysis results
        res.status(200).json({
          success: true,
          filePath: req.file.path,
          rowCount,
          columnCount,
          totalMissingValues,
          columnInfo,
        });
      })
      .on("error", (error) => {
        console.error("Error parsing CSV file:", error);
        res
          .status(500)
          .json({ success: false, message: "Error parsing CSV file" });
      });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ success: false, message: "Something went wrong" });
  }
};

export const filePreviewController = async (req, res) => {
  try {
    const { filePath } = req.query;
    console.log(filePath);
    if (!filePath) {
      return res
        .status(400)
        .json({ success: false, message: "File not uploaded" });
    }

    const { page = 1 } = req.query;
    const limit = 100;
    const skip = (page - 1) * limit;

    const stream = fs.createReadStream(filePath);
    let rowCount = 0;
    let chunkRowCount = 0;
    let currentChunk = [];

    csv
      .parseStream(stream, { headers: true })
      .on("data", (row) => {
        rowCount++;
        if (rowCount > skip) {
          // Skip rows until the desired page
          currentChunk.push(row);
          chunkRowCount++;
        }
        if (chunkRowCount === limit) {
          // Process the specified number of rows
          // Send paginated data
          res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(rowCount / limit),
            data: currentChunk,
          });
          // Exit early to prevent sending multiple responses
          stream.destroy();
        }
      })
      .on("end", () => {
        // Send the remaining data if any
        if (currentChunk.length > 0) {
          res.status(200).json({
            success: true,
            currentPage: page,
            totalPages: Math.ceil(rowCount / limit),
            data: currentChunk,
          });
        } else {
          res.status(200).json({ success: true, message: "No more data" });
        }
      })
      .on("error", (error) => {
        console.error("Error parsing CSV file:", error);
        res
          .status(500)
          .json({ success: false, message: "Error parsing CSV file" });
      });
  } catch (error) {
    console.log(error);
    res.status(500).json({ success: false, message: "Something went wrong" });
  }
};
