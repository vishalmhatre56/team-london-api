const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");

const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
	res.send('Running');
});
let roomID = "9898777667"
io.on("connection", (socket) => {
		
	socket.join(roomID);
	io.to(roomID).emit("me", roomID)

	socket.on("disconnect", () => {
		console.log('disconnect is getting called');
		io.to(roomID).emit("callEnded")
	});

	socket.on("callUser", ({ userToCall, signalData, from, name }) => {
		socket.to(roomID).emit("callUser", { signal: signalData, from, name });
	});

	socket.on("answerCall", (data) => {
		io.to(roomID).emit("callAccepted", data.signal)
	});
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
