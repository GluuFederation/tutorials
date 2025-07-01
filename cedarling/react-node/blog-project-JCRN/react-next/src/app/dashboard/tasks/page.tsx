"use client";

import { makeUserAuthentication } from "@/factories/makeUserAuthentication";
import { useCedarling } from "@/factories/useCedarling";
import { AuthorizeResult } from "@janssenproject/cedarling_wasm";
import { useState } from "react";
import { FaEdit, FaPlus, FaTrash } from "react-icons/fa";

export default function TasksPage() {
  const initialTasks = [
    {
      id: 1,
      name: "Design Home Page",
      description: "Create the layout and design for the homepage.",
      status: "In Progress",
    },
    {
      id: 2,
      name: "Implement User Authentication",
      description: "Add login and signup functionality.",
      status: "Pending",
    },
    {
      id: 3,
      name: "Test Payment Gateway",
      description: "Ensure the payment gateway integration works correctly.",
      status: "Completed",
    },
    {
      id: 4,
      name: "Optimize Database Queries",
      description: "Improve the performance of database queries.",
      status: "Completed",
    },
  ];
  const [tasks] = useState(initialTasks);
  const { authorize } = useCedarling();
  const userAuthentication = makeUserAuthentication();

  const cedarlingRequest = async (action: string) => {
    const idToken = await userAuthentication.getIdToken();
    const accessToken = await userAuthentication.getAccessToken();

    const request = {
      tokens: {
        access_token: accessToken,
        id_token: idToken,
      },
      action: `Jans::Action::"${action}"`,
      resource: {
        type: "Jans::Task",
        id: "App",
        app_id: "App",
        name: "App",
        url: {
          host: "jans.test",
          path: "/",
          protocol: "http",
        },
      },
      context: {},
    };

    const result: AuthorizeResult = await authorize(request);
    return result;
  };

  const handleAdd = async () => {
    try {
      const result = await cedarlingRequest("Add");
      console.log(result);
      if (result.decision) {
        alert("Successfully added!");
      } else {
        alert("You are not allowed to add new Task!");
      }
    } catch (e) {
      alert("You are not allowed to add new Task!");
      console.log(e);
    }
  };

  const handleUpdate = async () => {
    try {
      const result = await cedarlingRequest("Update");
      console.log(result);
      if (result.decision) {
        alert("Successfully updated!");
      } else {
        alert("You are not allowed to update task!");
      }
    } catch (e) {
      alert("You are not allowed to update task!");
      console.log(e);
    }
  };

  const handleDelete = async () => {
    try {
      const result = await cedarlingRequest("Delete");
      console.log(result);
      if (result.decision) {
        alert("Successfully deleted!");
      } else {
        alert("You are not allowed to delete task!");
      }
    } catch (e) {
      alert("You are not allowed to delete task!");
      console.log(e);
    }
  };

  return (
    <div className="p-4">
      <h1>Tasks</h1>
      <button className="btn btn-primary mb-3" onClick={handleAdd}>
        <FaPlus className="me-2" />
        Add Task
      </button>
      <table className="table table-striped table-bordered">
        <thead>
          <tr>
            <th>ID</th>
            <th>Name</th>
            <th>Description</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => (
            <tr key={task.id}>
              <td>{task.id}</td>
              <td>{task.name}</td>
              <td>{task.description}</td>
              <td>{task.status}</td>
              <td>
                <button
                  className="btn btn-sm btn-warning me-2"
                  onClick={() => handleUpdate()}
                >
                  <FaEdit />
                </button>
                <button
                  className="btn btn-sm btn-danger"
                  onClick={() => handleDelete()}
                >
                  <FaTrash />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
