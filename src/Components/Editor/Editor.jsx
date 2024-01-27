import React, { useCallback, useEffect, useState } from "react";
import "./Editor.css";
import { useParams } from "react-router-dom";
import { useUserContext } from "../../Store/UserStore";
import { useNavigate } from "react-router-dom";

import Quill from "quill";
import "quill/dist/quill.snow.css";

import { io } from "socket.io-client";

import { IoMdMenu } from "react-icons/io";
import { IoHomeSharp } from "react-icons/io5";
import { IoLogOut } from "react-icons/io5";
import { IoMdClose } from "react-icons/io";

const TOOLBAR_OPTIONS = [
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ font: [] }],
  [{ list: "ordered" }, { list: "bullet" }],
  ["bold", "italic", "underline"],
  [{ color: [] }, { background: [] }],
  [{ script: "sub" }, { script: "super" }],
  [{ align: [] }],
  ["image", "blockquote", "code-block"],
  ["clean"],
];
function Editor() {
  const id = useParams().id;
  const userContext = useUserContext();
  const navigate = useNavigate();
  const [doc, setDoc] = useState({});
  const [socket, setSocket] = useState();
  const [quill, setQuill] = useState();
  const [saving, setSaving] = useState(false);
  useEffect(() => {
    if (userContext.user.token == "") {
      navigate("/login");
    }
  }, []);
  useEffect(() => {
    const ENDPOINT = userContext.ENDPOINT;
    fetch(`${ENDPOINT}/doc/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userContext.user.token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setDoc(data);
      });
  }, []);
  const wrapperRef = useCallback((wrapper) => {
    if (wrapper == null) return;
    wrapper.innerHTML = "";
    const editor = document.createElement("div");
    wrapper.append(editor);
    const q = new Quill(editor, {
      theme: "snow",
      modules: { toolbar: TOOLBAR_OPTIONS },
    });
    q.disable();
    q.setText("Loading...");
    setQuill(q);
  }, []);

  useEffect(() => {
    const s = io("http://localhost:5000");
    setSocket(s);
    return () => {
      s.disconnect();
    };
  }, []);
  useEffect(() => {
    if (socket == null || quill == null) return;
    socket.emit("join", id);
    socket.once("joined", (document) => {
      quill.setText(document);
      quill.enable();
    });
  }, [socket, quill, id]);
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handler);
    return () => {
      socket.off("receive-changes", handler);
    };
  }, [socket, quill]);
  useEffect(() => {
    if (socket == null || quill == null) return;
    const handler = (delta, oldDelta, source) => {
      setDoc((prev) => {
        return { ...prev, content: quill.getText() };
      });
      if (source !== "user") return;
      socket.emit("send-changes", delta, id);
    };
    quill.on("text-change", handler);
    return () => {
      quill.off("text-change", handler);
    };
  }, [socket, quill]);

  useEffect(() => {
    const saveDocument = async (doc) => {
      setSaving(true);
      await fetch(`http://localhost:5000/api/doc/${id}/content`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${userContext.user.token}`,
        },
        body: JSON.stringify(doc),
      })
        .then((res) => res.json())
        .then((data) => {
          setSaving(false);
        });
    };
    const interval = setInterval(() => {
      if (doc.content == undefined) return;
      saveDocument(doc);
    }, 5000);
    return () => {
      clearInterval(interval);
    };
  }, [doc]);

  return (
    <>
      <div className="editor-wrapper" ref={wrapperRef}></div>
      <FloatMenu />
    </>
  );
}

export default Editor;

const FloatMenu = () => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const userContext = useUserContext();
  return (
    <div
      className="float-menu"
      onClick={(e) => {
        setMenuOpen(!menuOpen);
      }}
    >
      {!menuOpen ? <IoMdMenu size={"2rem"} /> : <IoMdClose size={"2rem"} />}
      <div
        className={`float-menu-button logout ${!menuOpen ? "disabled" : ""}`}
        onClick={(e) => {
          userContext.setUser({
            fistName: "",
            lastName: "",
            userName: "",
            email: "",
            token: "",
          });
          navigate("/login");
        }}
      >
        <IoLogOut size={"2rem"} />
      </div>
      <div
        className={`float-menu-button home ${!menuOpen ? "disabled" : ""}`}
        onClick={(e) => {
          navigate("/");
        }}
      >
        <IoHomeSharp size={"2rem"} />
      </div>
    </div>
  );
};
