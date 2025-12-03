# 🎥 VoidMeet v2 – Frontend

VoidMeet v2 is the improved frontend for a real-time video calling application built with WebRTC, PeerJS, and Socket.IO.

This version introduces **Google OAuth**, small UI touch-ups, an emoji picker in chat, and a cleaner authentication flow.

👉 **Backend (v2):** [VoidMeet_V2_Backend](https://github.com/dhirajdhande19/VoidMeet_V2_Backend)  
👉 **Live App:** [voidmeet.vercel.app](https://voidmeet.vercel.app)

---

## ✨ New in v2 (Frontend)

- 🔐 **Google OAuth Login**
- 😀 **Emoji Picker in Chat**
- 👤 Updated Login UI (Google button + cleaner layout)
- ⏳ Loader screen after OAuth redirect
- 📱 Minor responsive/UI improvements
- 🧹 Improved meeting cleanup logic
- 📂 Frontend isolated into its own repo

---

## 🚀 Features

- Real-time video/audio calls (WebRTC + PeerJS)
- Create or join video meeting rooms
- In-call chat (Socket.IO) with **emoji picker**
- Screen sharing
- Microphone & camera toggle
- Login with **JWT auth** or **Google OAuth**
- Responsive custom CSS UI (no Tailwind)

---

## 🛠 Tech Stack

- **React**
- **WebRTC**
- **PeerJS**
- **Socket.IO Client**
- **JWT Authentication**
- **CSS Modules**

---

## 📁 Project Structure

```md
src/
├── components/
├── contexts/
├── PageLayout/
├── pages/
├── styles/
└── utils/
````

---

## 🔧 Environment Variables

Create `.env` (or use `.env.example`):

```env
VITE_UNSPLASH_CLIENT_ID=your-client-id
VITE_BACKEND_URL=http://localhost:8080/api/v1   # or your deployed backend URL
```

*For production, set these variables in Vercel.*

---

## ▶️ Run Locally

```bash
npm install
npm run dev
```

App starts at:

```
http://localhost:5173
```

---

## 🙋‍♂️ Author

Built by **Dhiraj Dhande**  
GitHub: [dhirajdhande19](https://github.com/dhirajdhande19)
