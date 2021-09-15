const mongoose = require('mongoose')
const Doc = require('./documents')
const io = require('socket.io')(3001, {
  cors:{
    origin: "http://localhost:3000",
    methods: ["GET","POST"]
  }
})

mongoose.connect('mongodb://localhost/google-docs',{
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
const connection = mongoose.connection
connection.once("open",()=>{
    console.log("database established");
})

const defaultValue=""
io.on("connection", socket =>{
    socket.on('get-doc', async _id =>{
      const document = await findOrCreate(_id) 
      socket.join(_id)
      socket.emit('load-doc', document.data)
      socket.on('send-changes', delta =>{
        console.log(delta)
        socket.broadcast.to(_id).emit('receive-changes', delta)
      })
      socket.on('save-doc', async data=>{
        return await Doc.findByIdAndUpdate(_id, {data}) 
      })
  })
})

const findOrCreate= async(id)=>{
    if(id === null) return
    const document = await Doc.findById(id)
    if(document) return document
    return await Doc.create({_id: id, data: defaultValue})
}