import { render, S, api } from "./core.js";
import "./public.js";
import "./account.js";
render();
if (S.token) api("/notifications").then((l) => { S.unread = l.filter((n) => !n.read).length; if (S.unread) render(); }).catch(() => {});
