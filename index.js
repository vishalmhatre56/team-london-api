const app = require("express")();
const server = require("http").createServer(app);
const cors = require("cors");
const doctors = [{
	roomID: "9898777667",
	name: "Dr. John"
},
{
	roomID: "8888899999",
	name: "Dr Raje"
},
{
	roomID: "7777788888",
	name: "Dr. Kedar"
}]
const io = require("socket.io")(server, {
	cors: {
		origin: "*",
		methods: [ "GET", "POST" ]
	}
});

app.use(cors());

const PORT = process.env.PORT || 8081;

app.get('/', (req, res) => {
	res.send('Running');
});

app.get('/getDoctors', (req, res) => {
	res.send({doctors: doctors});
});

app.post('/login', (req, res) => {
	// validation of username and password
	let isDoctor = false;
	if (req.username && req.password) {
		doctors.map((obj)=>{
			if (obj.roomID == req.username) {
				isDoctor = true
			}
		})
		io.on("connection", (socket) => {
				let roomID = ""
				if (isDoctor) {
					roomID = req.username;
					socket.join(roomID);
					io.to(roomID).emit("me", roomID);
				} else {
					socket.emit("me", req.username);
				}
			
				socket.on("disconnect", () => {
					console.log('disconnect is getting called');
					io.to(roomID).emit("callEnded")
				});
			
				socket.on("callUser", ({ userToCall, signalData, from, name }) => {
					socket.to(userToCall).emit("callUser", { signal: signalData, from, name });
				});
			
				socket.on("answerCall", (data) => {
					roomID = data.to
					io.to(data.to).emit("callAccepted", data.signal)
				});
			});
			res.send({msg: "logged in successfully", token: "someJWTtoken"})
	} else {
		res.status(403).send("Username or password is not valid");
	}
});

server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
