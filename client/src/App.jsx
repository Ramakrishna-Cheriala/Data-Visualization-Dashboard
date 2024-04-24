import { BrowserRouter, Routes, Route, Link, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useSelector } from "react-redux";

import Home from "./pages/Home";
import PageNotFound from "./pages/PageNotFound";
import FileData from "./pages/FileData";

function App() {
  const { filePath } = useSelector((state) => state.misc);
  console.log(filePath);
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        {/* Render FileData component if filePath exists, otherwise redirect to Home */}
        <Route
          path="/preview"
          element={filePath ? <FileData /> : <Navigate to="/" />}
        />
        <Route path="*" element={<PageNotFound />} />
      </Routes>
      <Toaster position="top-center" />
    </BrowserRouter>
  );
}

export default App;
