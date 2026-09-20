import {Routes, Route ,Navigate} from "react-router";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Homepage from "./pages/Homepage";
import { useDispatch, useSelector } from 'react-redux';
import { checkAuth } from "./authSlice";
import { useEffect } from "react";
import AdminPanel from "./components/AdminPanel";
import ProblemPage from "./pages/ProblemPage"
import Admin from "./pages/Admin";
import AdminVideo from "./components/AdminVideo"
import AdminDelete from "./components/AdminDelete"
import AdminUpload from "./components/AdminUpload"
import AdminUpdate from "./components/AdminUpdate"
import AdminUpdateProblem from "./components/AdminUpdateProblem"
import Faculty from "./pages/Faculty"
import FacultySections from "./pages/FacultySections"
import SectionRoster from "./pages/SectionRoster"
import FacultyTests from "./pages/FacultyTests"
import TestResults from "./pages/TestResults"
import StudentTests from "./pages/StudentTests"
import TestAttempt from "./pages/TestAttempt"
import MyTestResult from "./pages/MyTestResult"
import Profile from "./pages/Profile"

function App(){
  
  const dispatch = useDispatch();
  const {isAuthenticated,user,loading} = useSelector((state)=>state.auth);

  // check initial authentication
  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <span className="loading loading-spinner loading-lg"></span>
    </div>;
  }

  return(
  <>
    <Routes>
      <Route path="/" element={isAuthenticated ?<Homepage></Homepage>:<Navigate to="/signup" />}></Route>
      <Route path="/login" element={isAuthenticated?<Navigate to="/" />:<Login></Login>}></Route>
      <Route path="/signup" element={isAuthenticated?<Navigate to="/" />:<Signup></Signup>}></Route>
      <Route path="/admin" element={isAuthenticated && user?.role === 'admin' ? <Admin /> : <Navigate to="/" />} />
      <Route path="/admin/create" element={isAuthenticated && user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/" />} />
      <Route path="/admin/delete" element={isAuthenticated && user?.role === 'admin' ? <AdminDelete /> : <Navigate to="/" />} />
      <Route path="/admin/update" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdate /> : <Navigate to="/" />} />
      <Route path="/admin/update/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpdateProblem /> : <Navigate to="/" />} />
      <Route path="/admin/video" element={isAuthenticated && user?.role === 'admin' ? <AdminVideo /> : <Navigate to="/" />} />
      <Route path="/admin/upload/:problemId" element={isAuthenticated && user?.role === 'admin' ? <AdminUpload /> : <Navigate to="/" />} />
      <Route path="/faculty" element={isAuthenticated && (user?.role === 'faculty' || user?.role === 'admin') ? <Faculty /> : <Navigate to="/" />} />
      <Route path="/faculty/sections" element={isAuthenticated && (user?.role === 'faculty' || user?.role === 'admin') ? <FacultySections /> : <Navigate to="/" />} />
      <Route path="/faculty/sections/:id" element={isAuthenticated && (user?.role === 'faculty' || user?.role === 'admin') ? <SectionRoster /> : <Navigate to="/" />} />
      <Route path="/faculty/tests" element={isAuthenticated && (user?.role === 'faculty' || user?.role === 'admin') ? <FacultyTests /> : <Navigate to="/" />} />
      <Route path="/faculty/tests/:id/results" element={isAuthenticated && (user?.role === 'faculty' || user?.role === 'admin') ? <TestResults /> : <Navigate to="/" />} />
      <Route path="/tests" element={isAuthenticated ? <StudentTests /> : <Navigate to="/login" />} />
      <Route path="/tests/:testId" element={isAuthenticated ? <TestAttempt /> : <Navigate to="/login" />} />
      <Route path="/tests/:testId/result" element={isAuthenticated ? <MyTestResult /> : <Navigate to="/login" />} />
      <Route path="/profile" element={isAuthenticated ? <Profile /> : <Navigate to="/login" />} />
      <Route path="/problem/:problemId" element={<ProblemPage/>}></Route>
      
    </Routes>
  </>
  )
}

export default App;