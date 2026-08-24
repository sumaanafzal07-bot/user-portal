import { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import { io } from "socket.io-client";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  

  useEffect(() => {
    const socket = io("https://mern-auth-api-production-3810.up.railway.app");

    socket.on("connect", () => {
        console.log("Socket connected:", socket.id);
    });
    socket.on("taskUpdated", (task) => {
    console.log("Real-time task update received:", task);

    setTasks((currentTasks) =>
        currentTasks.map((item) =>
            item._id === task._id ? task : item
        )
    );
});

    const fetchProfile = async () => {
        try {
          const response = await api.get("/auth/profile");

console.log("PROFILE:", response.data);

setUser(response.data);

socket.emit("joinUserRoom", response.data._id);
const tasksResponse = await api.get("/tasks");
console.log("TASKS FROM BACKEND:", tasksResponse.data);

setTasks(tasksResponse.data);
        } catch (error) {
            console.error("Profile error:", error);

            localStorage.removeItem("token");
            navigate("/login");
        } finally {
            setLoading(false);
        }
    };

    fetchProfile();

    return () => {
        socket.disconnect();
    };
}, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-white text-xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="bg-gray-800 px-8 py-5 flex justify-between items-center">
        <h1 className="text-2xl font-bold">
          User Portal
        </h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 px-5 py-2 rounded-lg font-semibold"
        >
          Logout
        </button>
      </nav>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="bg-gray-800 rounded-2xl p-8 shadow-xl">
          <h2 className="text-3xl font-bold mb-3">
            Welcome!
          </h2>

          <p className="text-gray-400 mb-8">
            You are successfully authenticated.
          </p>

          {user && (
            <div className="space-y-4">
              <div className="mt-8">
    <h3 className="text-2xl font-bold mb-4">
        Tasks
    </h3>

    {tasks.length === 0 ? (
        <p className="text-gray-400">
            No tasks yet.
        </p>
    ) : (
        <div className="space-y-4">
            {tasks.map((task) => (
                <div
                    key={task._id}
                    className="bg-gray-700 rounded-lg p-5"
                >
                    <h4 className="text-xl font-semibold">
                        {task.title}
                    </h4>

                    <p className="text-gray-400 mt-2">
                        {task.description}
                    </p>

                    <p className="mt-3">
                        Status:{" "}
                        <span className="font-semibold">
                            {task.status}
                        </span>
                    </p>
                </div>
            ))}
        </div>
    )}
</div>
              <div className="bg-gray-700 rounded-lg p-5">
                <p className="text-gray-400 text-sm">
                  Name
                </p>
                <p className="text-xl font-semibold">
                  {user.name}
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-5">
                <p className="text-gray-400 text-sm">
                  Email
                </p>
                <p className="text-xl font-semibold">
                  {user.email}
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default Dashboard;