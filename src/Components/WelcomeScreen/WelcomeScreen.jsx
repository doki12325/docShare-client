import React, { useCallback, useEffect, useState } from "react";
import "./WelcomeScreen.css";
import { useUserContext } from "../../Store/UserStore";
import { useNavigate } from "react-router-dom";

function WelcomeScreen() {
  const userContext = useUserContext();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [rename, setRename] = useState("");
  const [share, setShare] = useState("");
  const [contextMenu, setContextMenu] = useState({
    shown: false,
    x: 0,
    y: 0,
    id: "",
    rename: false,
    share: false,
  });
  const navigate = useNavigate();
  useEffect(() => {
    if (userContext.user.token == "") {
      navigate("/login");
    }
  }, []);
  useEffect(() => {
    setLoading(true);
    const ENDPOINT = userContext.ENDPOINT;
    fetch(`${ENDPOINT}/doc/`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.message || data == []) {
          setLoading(false);
          return;
        }
        setDocuments(data);
        setLoading(false);
      });
  }, []);

  const createNewDocument = useCallback(async () => {
    const ENDPOINT = userContext.ENDPOINT;
    await fetch(`${ENDPOINT}/doc/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!data.message) {
          setDocuments([...documents, data]);
          navigate(`/document/${data._id}`);
        }
      });
  }, []);

  const renameDocument = useCallback(async () => {
    const ENDPOINT = userContext.ENDPOINT;
    await fetch(`${ENDPOINT}/doc/${contextMenu.id}/title`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.user.token}`,
      },
      body: JSON.stringify({ title: rename }),
    }).then((res) => {
      if (res.status == 200) {
        setDocuments((prev) => {
          return prev.map((doc) => {
            if (doc._id == contextMenu.id) {
              return { ...doc, title: rename };
            }
            return doc;
          });
        });
        setContextMenu((prev) => ({ ...prev, rename: false }));
      } else {
        alert("Error renaming document!");
      }
    });
  }, [rename]);

  const shareDocument = useCallback(async () => {
    const ENDPOINT = userContext.ENDPOINT;
    await fetch(`${ENDPOINT}/doc/${contextMenu.id}/share`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.user.token}`,
      },
      body: JSON.stringify({ email: share }),
    }).then((res) => {
      if (res.status == 200) {
        alert("Document shared successfully!");
        setContextMenu((prev) => ({ ...prev, share: false }));
      } else {
        alert("Error sharing document!");
      }
    });
  }, [share]);
  return (
    <div className="welcome-wrapper">
      <div className="welcome-title">
        <span>Welcome, </span>{" "}
        <span>{`${userContext.user.firstName} ${userContext.user.lastName}`}</span>
      </div>
      <div className="welcome-documents">
        <div
          className="doc-wrapper"
          onClick={(e) => {
            createNewDocument();
          }}
        >
          <div className="doc-main"></div>
          <div className="doc-title">New Document</div>
        </div>
        {documents.map((data, index) => (
          <div
            className="doc-wrapper"
            key={index}
            onClick={(e) => {
              navigate(`/document/${data._id}`);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu((prev) => ({
                ...prev,
                shown: true,
                x: e.clientX,
                y: e.clientY,
                id: data._id,
              }));
            }}
          >
            <div className="doc-main"></div>
            <div className="doc-title">{data.title}</div>
          </div>
        ))}
      </div>
      {contextMenu.shown && (
        <ContextMenu
          {...contextMenu}
          setContextMenu={setContextMenu}
          setDocuments={setDocuments}
        />
      )}
      {contextMenu.rename && (
        <div className="rename-wrapper">
          <div className="rename-main">
            <div className="rename-title">Rename Document</div>
            <input
              type="text"
              className="rename-input"
              placeholder="Enter new name..."
              value={rename}
              onChange={(e) => {
                setRename(e.target.value);
              }}
            />
            <div className="rename-buttons">
              <button
                className="rename-button"
                onClick={(e) => {
                  e.preventDefault();
                  renameDocument();
                }}
              >
                Rename
              </button>
              <button
                className="rename-button"
                onClick={(e) => {
                  e.preventDefault();
                  setContextMenu((prev) => ({ ...prev, rename: false }));
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {contextMenu.share && (
        <div className="rename-wrapper">
          <div className="rename-main">
            <div className="rename-title">Share Document</div>
            <input
              type="text"
              className="rename-input"
              placeholder="Enter email..."
              value={share}
              onChange={(e) => {
                setShare(e.target.value);
              }}
            />
            <div className="rename-buttons">
              <button
                className="rename-button"
                onClick={(e) => {
                  e.preventDefault();
                  shareDocument();
                }}
              >
                Share
              </button>
              <button
                className="rename-button"
                onClick={(e) => {
                  e.preventDefault();
                  setContextMenu((prev) => ({ ...prev, share: false }));
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WelcomeScreen;

const ContextMenu = (props) => {
  const userContext = useUserContext();
  const deleteDocument = useCallback(async () => {
    const ENDPOINT = userContext.ENDPOINT;
    await fetch(`${ENDPOINT}/doc/${props.id}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.user.token}`,
      },
    }).then((res) => {
      if (res.status == 200) {
        props.setDocuments((prev) => {
          return prev.filter((doc) => doc._id != props.id);
        });
        props.setContextMenu((prev) => ({
          ...prev,
          shown: false,
          x: 0,
          y: 0,
          id: "",
        }));
      }
    });
  }, []);
  return (
    <div className={`context-main`} style={{ top: props.y, left: props.x }}>
      <div
        className="context-item"
        onClick={(e) => {
          e.preventDefault();
          props.setContextMenu((prev) => ({
            ...prev,
            shown: false,
            rename: false,
            share: true,
          }));
        }}
      >
        Share
      </div>
      <div
        className="context-item"
        onClick={(e) => {
          e.preventDefault();
          props.setContextMenu((prev) => ({
            ...prev,
            shown: false,
            rename: true,
          }));
        }}
      >
        Rename
      </div>
      <div
        className="context-item"
        onClick={(e) => {
          e.preventDefault();
          deleteDocument();
        }}
      >
        Delete Document
      </div>
    </div>
  );
};
