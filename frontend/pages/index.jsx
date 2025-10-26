import { useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";

export default function Home() {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "Halo 👋! Saya chatbot diagnosa penyakit. Apa keluhanmu hari ini?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const newMessages = [...messages, { sender: "user", text: input }];
    setMessages(newMessages);
    setInput("");
    setLoading(true);

    try {
      const res = await axios.post("http://127.0.0.1:8000/predict", {
        text: input,
        model: "Naive Bayes"
      });
      const botReply = `${res.data.response}\n💊 ${res.data.rekomendasi}`;
      setMessages([...newMessages, { sender: "bot", text: botReply }]);
    } catch (err) {
      setMessages([...newMessages, { sender: "bot", text: "⚠️ Terjadi kesalahan di server." }]);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-between">
      <div className="w-full max-w-3xl flex flex-col flex-1">
        <h1 className="text-3xl font-bold text-center mt-8 text-blue-600">🧠 Chatbot Diagnosa Penyakit</h1>
        <div className="flex-1 mt-6 overflow-y-auto p-4 bg-white rounded-lg shadow">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              className={`my-2 p-3 rounded-lg w-fit max-w-[75%] ${
                msg.sender === "user"
                  ? "ml-auto bg-blue-500 text-white"
                  : "mr-auto bg-gray-200 text-gray-800"
              }`}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {msg.text}
            </motion.div>
          ))}
          {loading && (
            <div className="text-gray-400 italic">Bot sedang mengetik...</div>
          )}
        </div>

        <div className="flex mt-4">
          <input
            className="flex-1 border p-3 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis keluhanmu..."
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />
          <button
            onClick={sendMessage}
            className="bg-blue-600 text-white px-5 rounded-r-lg hover:bg-blue-700"
          >
            Kirim 🚀
          </button>
        </div>
      </div>

      <footer className="p-4 text-sm text-gray-500 text-center">
        © 2025 Chatbot Diagnosa Penyakit — Naive Bayes & Random Forest
      </footer>
    </div>
  );
}
