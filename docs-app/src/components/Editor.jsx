import React, { useState, useEffect } from "react";
import "quill/dist/quill.snow.css";
import Quill from "quill";
import "./style.css";
import { io } from "socket.io-client";
import { useParams } from "react-router-dom";

export default function Editor() {
  const toolbarOptions = [
    ["bold", "italic", "underline", "strike"], // toggled buttons
    ["blockquote", "code-block"],

    [{ header: 1 }, { header: 2 }], // custom button values
    [{ list: "ordered" }, { list: "bullet" }],
    [{ script: "sub" }, { script: "super" }], // superscript/subscript
    [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
    [{ direction: "rtl" }], // text direction

    [{ size: ["small", false, "large", "huge"] }], // custom dropdown
    [{ header: [1, 2, 3, 4, 5, 6, false] }],

    [{ color: [] }, { background: [] }], // dropdown with defaults from theme
    [{ font: [] }],
    [{ align: [] }],

    ["clean"], // remove formatting button
  ];
  const { id: _id } = useParams();
  const [toolbar, setToolBar] = useState(false);
  const [socket, setSocket] = useState(null);
  const [quill, setQuill] = useState(null);

  useEffect(() => {
    if (toolbar) {
      const s = io("http://localhost:3001/");
      console.log(s);
      setSocket(s);
      return () => {
        s.disconnect();
      };
    }
    const q = new Quill("#container", {
      theme: "snow",
      modules: { toolbar: toolbarOptions },
    });
    setToolBar(true);
    q.disable();
    q.setText("loading");
    setQuill(q);
    return quill;
  }, [toolbar]);

  useEffect(() => {
    if (socket === null || quill === null) return;
    const handleReceive = (delta) => {
      quill.updateContents(delta);
    };
    socket.on("receive-changes", handleReceive);
    const handleChange = (delta, oldDelta, source) => {
      if (source !== "user") return;
      socket.emit("send-changes", delta);
    };
    quill.on("text-change", handleChange);
    const interval = setInterval(() => {
      socket.emit("save-doc", quill.getContents());
    }, 3000);
    return () => {
      quill.off("text-change", handleChange);
      socket.off("receive-changes", handleReceive);
      clearInterval(interval);
    };
  }, [socket, quill]);

  useEffect(() => {
    if (socket === null || quill === null) return;
    socket.once("load-doc", (doc) => {
      quill.setContents(doc);
      quill.enable();
    });
    socket.emit("get-doc", _id);
  }, [quill, socket, _id]);

  return <div id="container"></div>;
}
