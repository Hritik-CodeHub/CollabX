import { Server } from "socket.io"

let connections = [];
let messages = {};
let timeOnline = {};

export const connectToSocket = (server) => {
    const io = new Server(server,{
        cors:{
            origin: "*",
            methods: ["GET", "POST"],
            allowedHeaders: ["*"],
            credentials: true
        }
    }
    );

    io.on("connection", (socket) => {

        console.log("connected");
        
        socket.on("join-call", (path) => {

            if (connections[path] === undefined) {
                connections[path] = [];
            }

            connections[path].push(socket.id);

            timeOnline[socket.id] = new Date();

            for (const element of connections[path]) {
                io.to(element).emit("user-joined", socket.id, connections[path]);
            }

            if (messages[path] !== undefined) {
                for (const element of messages[path]) {
                    io.to(socket.id).emit("chat-message", element['data'],
                        element['sender'],
                        element['socket-id-sender']

                    )

                }
            }
        });

        socket.on("signal", (toId, message) => {
            io.to(toId).emit("signal", socket.id, message);
        });

        socket.on("chat-message", (data, sender) => {
            const [matchinRoom, found] = Object.entries(connections)
                .reduce(([room, isFound], [roomKey, roomValue]) => {
                    if (!isFound && roomValue.includes(socket.id)) {
                        return [roomKey, true];
                    }
                }, ['', false]);

            if (found === true) {
                if (messages[matchinRoom] === undefined) {
                    messages[matchinRoom] = [];
                }

                messages[matchinRoom].push({ "data": data, "sender": sender, "socket-id-sender": socket.id });
                console.log("message", matchinRoom, ":", sender, data);

                connections[matchinRoom].forEach((element) => {
                    io.to(element).emit("chat-message", data, sender, socket.id);
                });
            }
        });

        socket.on("disconnect", () => {
            let diffTime = Math.abs(timeOnline[socket.id] - Date.now());
            let key;
            for (const [k, v] of structuredClone(connections)) {
                key = k;
                for (const element of connections[key]) {
                    io.to(element).emit("user-left", socket.id);
                }

                let index = connections[key].indexOf(socket.id);
                if (index > -1) {
                    connections[key].splice(index, 1);
                }

                if (connections[key].length === 0) {
                    delete connections[key];
                }
            }
        });
    });

    return io;
}