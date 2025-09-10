"use client";
import axios from "axios";
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
import { accountAtom } from "@/factories/atoms";
import { useAtom } from "jotai";

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
  const { authorize_unsigned } = useCedarling();
  const [account, setAccount] = useAtom(accountAtom);
  console.log("Account from atom:", account);
  const cedarlingRequest = async (action: string) => {
    const principals = [
      {
        cedar_entity_mapping: {
          entity_type: "Jans::User",
          id: account.userId,
        },
        role: account.roles,
        sub: account.userId,
        plan: account.plan,
      },
    ];

    const request = {
      principals,
      action: `Jans::Action::"${action}"`,
      resource: {
        name: "JansBlogPlatform",
        cedar_entity_mapping: {
          entity_type: "Jans::AItools",
          id: "JansBlogPlatform",
        },
        url: {
          host: "jans.test",
          path: "/",
          protocol: "http",
        },
      },
      context: {},
    };

    const result: AuthorizeResult = await authorize_unsigned(request);
    return result;
  };

  const handleAdd = async () => {
    try {
      const response: any = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/article`
      );

      console.log("Article added: ", response.data);
      alert("Successfully article added!");
    } catch (e) {
      alert("You are not allowed to add article!");
      console.error(e);
    }
  };

  const handleUpdate = async () => {
    try {
      const response: any = await axios.put(
        `${process.env.NEXT_PUBLIC_API_URL}/article`
      );

      console.log("Article updated: ", response.data);
      alert("Successfully article updated!");
    } catch (e) {
      alert("You are not allowed to update article!");
      console.error(e);
    }
  };

  const handleDelete = async () => {
    try {
      const response: any = await axios.delete(
        `${process.env.NEXT_PUBLIC_API_URL}/article/1`
      );

      console.log("Article delete: ", response.data);
      alert("Successfully article deleted!");
    } catch (e) {
      alert("You are not allowed to delete article!");
      console.error(e);
    }
  };

  const handleAIAgentConversation = async () => {
    try {
      const result = await cedarlingRequest("Conversation");
      console.log(result);
      if (result.decision) {
        alert("You can access AI chat!");
      } else {
        alert("You are not allowed to access AI chat!");
      }
    } catch (e) {
      alert("You are not allowed to access AI chat!");
      console.log(e);
    }
  };

  const handleAIAgentImageGenerate = async () => {
    try {
      const result = await cedarlingRequest("GenerateImage");
      console.log(result);
      if (result.decision) {
        alert("You can access Generate Image tool!");
      } else {
        alert("You are not allowed to access Generate Image tool!");
      }
    } catch (e) {
      alert("You are not allowed to access Generate Image tool!");
      console.log(e);
    }
  };

  const handleAIAgentVideoGenerate = async () => {
    try {
      const result = await cedarlingRequest("GenerateVideo");
      console.log(result);
      if (result.decision) {
        alert("You can access Generate Video tool!");
      } else {
        alert("You are not allowed to access Generate Video tool!");
      }
    } catch (e) {
      alert("You are not allowed to access Generate Video tool!");
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
        onClick={handleAIAgentConversation}
      >
        <FaTools className="me-2" />
        Ask AI
      </button>
      <button
        className="btn btn-link btn-outline-primary mb-3 ms-3"
        onClick={handleAIAgentImageGenerate}
      >
        <FaImage className="me-2" />
        Generate images
      </button>
      <button
        className="btn btn-link btn-outline-primary mb-3 ms-3"
        onClick={handleAIAgentVideoGenerate}
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
