"use client";

import { makeUserAuthentication } from "@/factories/makeUserAuthentication";
import { useCedarling } from "@/factories/useCedarling";
import { AuthorizeResult } from "@janssenproject/cedarling_wasm";
import { useState } from "react";
import {
  FaEdit,
  FaPlus,
  FaTrash,
  FaTools,
  FaVideo,
  FaImage,
} from "react-icons/fa";

export default function TasksPage() {
  const initialTasks = [
    {
      id: 1,
      name: "Janssen Project is a Digital Public Good",
      content:
        "Citizens want to use the Internet to connect to their government for a myriad of reasons...",
      status: "Draft",
    },
    {
      id: 2,
      name: "Multi Master Multi-Cluster LDAP (OpenDJ) replication in Kubernetes? A controversial view",
      content:
        "OpenDJ is a Lightweight Directory Access Protocol (LDAP) compliant distributed directory written in Java...",
      status: "Draft",
    },
    {
      id: 3,
      name: "Gluu Flex Roadmap",
      content:
        "As Flex is a commercial distribution of the Janssen Project, check the Janssen Nightly Build changelog and issues....",
      status: "Published",
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
      <h1>Articles</h1>
      <button className="btn btn-primary mb-3" onClick={handleAdd}>
        <FaPlus className="me-2" />
        Write new Articles
      </button>
      <button
        className="btn btn-link btn-outline-primary mb-3 ms-3"
        onClick={handleAdd}
      >
        <FaTools className="me-2" />
        AI agent
      </button>
      <button
        className="btn btn-link btn-outline-primary mb-3 ms-3"
        onClick={handleAdd}
      >
        <FaImage className="me-2" />
        Generate images
      </button>
      <button
        className="btn btn-link btn-outline-primary mb-3 ms-3"
        onClick={handleAdd}
      >
        <FaVideo className="me-2" />
        Generate videos
      </button>

      {tasks.map((task) => (
        <div className="card mt-2" key={task.id}>
          <div className="card-body">
            <h5 className="card-title">{task.name}</h5>
            <p className="card-text">{task.content}</p>

            <button
              className="btn btn-sm btn-outline-info me-2"
              onClick={() => handleUpdate()}
              title="Edit article"
            >
              <FaEdit />
            </button>
            <button
              className="btn btn-sm btn-outline-danger"
              onClick={() => handleDelete()}
              title="Delete article"
            >
              <FaTrash />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
