import os
import uuid
import pandas as pd
import numpy as np
import json

from django.conf import settings
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse


def data_df(data):
    numeric_stats = data.describe()
    cols = data.columns
    col_dtypes = {}

    for col in cols:
        dtype = str(data[col].dtype)
        if col in numeric_stats.columns:  # Check if the column exists in numeric_stats
            col_stats = numeric_stats[col].to_dict()
            if dtype in [
                "float64",
                "int64",
            ]:  # Check if the data type is numeric
                col_dtypes[col] = {
                    "type": dtype,
                    "missing_values": int(data[col].isnull().sum()),
                    "mean": round(col_stats.get("mean", 0), 2),
                    "median": col_stats.get("50%", 0),
                    "mode": (float(data[col].mode()[0]) if not data[col].empty else 0),
                    "max": (float(data[col].max()) if not data[col].empty else 0),
                    "min": (float(data[col].min()) if not data[col].empty else 0),
                    "threshold": round(data[col].isnull().mean() * 100, 2),
                }
            else:
                col_dtypes[col] = {
                    "type": dtype,
                    "missing_values": int(data[col].isnull().sum()),
                    "threshold": round(data[col].isnull().mean() * 100, 2),
                }
        else:
            # Handle case when column is not found in numeric_stats
            col_dtypes[col] = {
                "type": dtype,
                "missing_values": int(data[col].isnull().sum()),
                "threshold": round(data[col].isnull().mean() * 100, 2),
                # You might want to handle other keys here depending on your requirements
            }

    return col_dtypes


@csrf_exempt
def upload_file(request):
    if request.method == "POST" and request.FILES.get("file"):
        uploaded_file = request.FILES["file"]
        if uploaded_file.name.endswith(".csv"):

            unique_filename = str(uuid.uuid4())
            _, file_extension = os.path.splitext(uploaded_file.name)
            upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")

            if not os.path.exists(upload_dir):
                os.makedirs(upload_dir)

            file_path = os.path.join(upload_dir, f"{unique_filename}{file_extension}")
            with open(file_path, "wb") as destination:
                for chunk in uploaded_file.chunks():
                    destination.write(chunk)

            # filePath = os.path.join(
            #     upload_dir, "e3cf3a03-0b03-43c4-b9e3-2d6ece021c84.csv"
            # )

            data = pd.read_csv(file_path, encoding="utf-8")
            cols = data.columns
            columnCount = data.shape[1]
            rowCount = data.shape[0]

            total_null_values = int(data.isnull().sum().sum())

            numeric_stats = data.describe()

            col_dtypes = data_df(data)

            return JsonResponse(
                {
                    "success": True,
                    "columnCount": columnCount,
                    "rowCount": rowCount,
                    "totalMissingValues": total_null_values,
                    "columnInfo": col_dtypes,
                    "fileId": f"{unique_filename}",
                    "message": "File uploaded successfully",
                },
                status=200,
            )
        else:
            return JsonResponse(
                {"success": False, "message": "Only CSV files are supported"},
                status=400,
            )
    else:
        return JsonResponse(
            {"success": False, "message": "No file uploaded"}, status=500
        )


def file_preview_controller(request, id):
    try:
        # Get the file path from the query parameters
        # file_path = request.GET.get("filePath")

        upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
        file_path = os.path.join(upload_dir, f"{id}.csv")
        if not file_path:
            return JsonResponse(
                {"success": False, "message": "File not uploaded"}, status=400
            )

        # Get the page number from the query parameters, default to 1 if not provided
        page = int(request.GET.get("page", 1))
        limit = 100
        skip = (page - 1) * limit

        # Check if the file exists
        if not os.path.exists(file_path):
            return JsonResponse(
                {"success": False, "message": "File not found"}, status=404
            )

        # Read the CSV file using pandas
        if page == 1:
            # Read the CSV with header to get column names for the first page
            data = pd.read_csv(file_path, nrows=limit)
            col_names = data.columns.tolist()
        else:
            # Read the CSV without header for subsequent pages
            data = pd.read_csv(file_path, skiprows=skip, nrows=limit, header=None)
            col_names = None

        # Convert DataFrame to array without including column names
        json_data = data.to_dict(orient="records")

        # Get the total number of rows in the CSV file
        total_rows = sum(1 for _ in open(file_path))

        # Calculate the total number of pages
        total_pages = (total_rows + limit - 1) // limit

        return JsonResponse(
            {
                "success": True,
                "currentPage": page,
                "totalPages": total_pages,
                "data": json_data,
            }
        )

    except Exception as e:
        print(e)
        return JsonResponse(
            {"success": False, "message": "Something went wrong"}, status=500
        )


@csrf_exempt
def preprocess_data(request, id):
    try:
        if request.method == "POST":
            print("id: ", id)
            tasks = json.loads(request.body)
            upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
            file_path = os.path.join(upload_dir, f"{id}.csv")
            if not file_path:
                return JsonResponse(
                    {"success": False, "message": "File not uploaded"}, status=400
                )

            df = pd.read_csv(file_path)

            for task in tasks:

                if task["is_delete"]:
                    col_name = task["col_name"]
                    if col_name != "":
                        df.drop(columns=col_name, inplace=True)
                        continue
                    else:
                        return JsonResponse(
                            {
                                "success": False,
                                "message": "Column name must be provided.",
                            },
                            status=400,
                        )

                if task["is_rename"]:
                    col_name = task["col_name"]
                    df.rename(columns={col_name: task["new_name"]}, inplace=True)

                if task["handle_null_values"]:

                    if task["method"] == "mean":
                        col_name = task["col_name"]
                        if col_name != "":
                            if str(df[col_name].dtype) != "object":
                                mean_value = df[col_name].mean()
                                df[col_name] = df[col_name].fillna(round(mean_value, 2))
                            else:
                                return JsonResponse(
                                    {
                                        "success": False,
                                        "message": "Column should not be a String or Object type",
                                    },
                                    status=400,
                                )
                        else:
                            return JsonResponse(
                                {
                                    "success": False,
                                    "message": "Column name must be provided.",
                                },
                                status=400,
                            )

                    # Median
                    elif task["method"] == "median":
                        col_name = task["col_name"]
                        if col_name != "":
                            if str(df[col_name].dtype) != "object":
                                median_value = df[col_name].median()
                                df[col_name] = df[col_name].fillna(median_value)
                            else:
                                return JsonResponse(
                                    {
                                        "success": False,
                                        "message": "Column should not be a String or Object type",
                                    },
                                    status=400,
                                )
                        else:
                            return JsonResponse(
                                {
                                    "success": False,
                                    "message": "Column name must be provided.",
                                },
                                status=400,
                            )

                    # Mode
                    elif task["method"] == "mode":
                        col_name = task["col_name"]
                        if col_name != "":
                            mode_value = df[col_name].mode()
                            df[col_name] = df[col_name].fillna(mode_value[0])

                        else:
                            return JsonResponse(
                                {
                                    "success": False,
                                    "message": "Column name must be provided.",
                                },
                                status=400,
                            )

                    # Constant values
                    elif task["method"] == "constant":
                        col_name = task["col_name"]
                        const_value = task["const_value"]
                        if col_name != "":
                            if str(df[col_name].dtype) in ["int64", "float64"]:
                                # Fill numeric data type with numeric value
                                numeric_value = pd.to_numeric(const_value)
                                df[col_name] = df[col_name].fillna(numeric_value)
                            elif str(df[col_name].dtype) in ["object", "string"]:
                                df[col_name] = df[col_name].fillna(str(const_value))
                            else:
                                return JsonResponse(
                                    {
                                        "success": False,
                                        "message": "Constant value should be either string or numeric.",
                                    },
                                    status=400,
                                )
                        else:
                            return JsonResponse(
                                {
                                    "success": False,
                                    "message": "Column name must be provided.",
                                },
                                status=400,
                            )

                    # forward_fill and backward_fill
                    elif task["method"] == "forward_backward_fill":
                        col_name = task["col_name"]
                        fill_type = task["fill_type"]
                        print("fill_type: ", fill_type)
                        if fill_type == "":
                            return JsonResponse(
                                {"success": False, "message": "Fill type Required"}
                            )
                        if col_name != "":
                            df[col_name] = df[col_name].fillna(fill_type)
                        else:
                            return JsonResponse(
                                {
                                    "success": False,
                                    "message": "Column name must be provided.",
                                },
                                status=400,
                            )

            cleaned_data_dir = os.path.join(settings.MEDIA_ROOT, "cleaned_data")
            if not os.path.exists(cleaned_data_dir):
                os.makedirs(cleaned_data_dir)
            cleaned_file_path = os.path.join(cleaned_data_dir, f"cleaned-{id}.csv")
            df.to_csv(cleaned_file_path, index=False)

            col_dtypes = data_df(df)
            columnCount = df.shape[1]
            rowCount = df.shape[0]
            total_null_values = int(df.isnull().sum().sum())

            return JsonResponse(
                {
                    "success": True,
                    "columnCount": columnCount,
                    "rowCount": rowCount,
                    "totalMissingValues": total_null_values,
                    "columnInfo": col_dtypes,
                    "message": "Data Cleaning Successfull",
                },
                status=200,
            )

    except Exception as e:
        print(e)
        return JsonResponse(
            {"success": False, "message": "Something went wrong"}, status=500
        )


@csrf_exempt
def data_visualization_controller(request, id):
    try:
        if request.method == "POST":
            selected_columns = json.loads(request.body)
            print(selected_columns)
            upload_dir = os.path.join(settings.MEDIA_ROOT, "cleaned_data")
            file_path = os.path.join(upload_dir, f"cleaned-{id}.csv")
            if not os.path.exists(file_path):
                upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
                file_path = os.path.join(upload_dir, f"{id}.csv")

            if not file_path:
                return JsonResponse(
                    {"success": False, "message": "File not uploaded"}, status=400
                )

            df = pd.read_csv(file_path)

            labels = df[selected_columns[0]].value_counts().tolist()
            # print(labels)
            datasets = []
            for col in selected_columns[1:]:
                datasets.append(
                    {
                        "label": col,
                        "data": df[col].value_counts().tolist(),
                    }
                )
            chart_data = {"labels": labels, "datasets": datasets}

            return JsonResponse({"success": True, "data": chart_data})
    except Exception as e:
        print(e)
        return JsonResponse(
            {"success": False, "message": "Something went wrong"}, status=500
        )


@csrf_exempt
def data_visualization_controller_1(request, id):
    try:
        if request.method == "POST":
            selected_columns = json.loads(request.body)
            print(selected_columns)
            upload_dir = os.path.join(settings.MEDIA_ROOT, "cleaned_data")
            file_path = os.path.join(upload_dir, f"cleaned-{id}.csv")
            if not os.path.exists(file_path):
                upload_dir = os.path.join(settings.MEDIA_ROOT, "uploads")
                file_path = os.path.join(upload_dir, f"{id}.csv")

            if not file_path:
                return JsonResponse(
                    {"success": False, "message": "File not uploaded"}, status=400
                )

            df = pd.read_csv(file_path)

            chart_data = []
            for index, row in df.iterrows():
                data_point = {
                    selected_columns[0]: row[
                        selected_columns[0]
                    ],  # First column for X-axis
                }
                # Add data points for remaining columns (Y-axis)
                for col in selected_columns[1:]:
                    data_point[col] = row[col]
                chart_data.append(data_point)

            return JsonResponse({"success": True, "data": chart_data[:10]})

    except Exception as e:
        print(e)
        return JsonResponse(
            {"success": False, "message": "Something went wrong"}, status=500
        )
