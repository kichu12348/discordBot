const {Schema,model,connect} = require('mongoose')

const storeSchema = new Schema({
    username:{
        type:String,
    },
    data:{
        type:String,
    }
})

const Store = model('Store',storeSchema)

const connectToDB = async (URI) => {
   await connect(URI).then(() => {
         console.log('Connected to the database 😎')
    }).catch((error) => {
        console.log(error)
    })
}

const saveData = async (username,data) => {
    try {
        await Store.create({username,data})
    } catch (error) {
        console.log(error)
    }
}

const getData = async (username) => {
    try {
        const data = await Store.findOne({username})
        return data
    } catch (error) {
        console.log(error)
    }
}

const handleStore = async (message) => {
    try {
        const username = message.author.username
        if(message.content.toLowerCase().includes('/store')){
            if(message.content.split('/store')[1] === '' || null){
                message.reply({
                    content:'Please provide a valid data to store'
                })
                return
            }
            const doesExist = await Store.findOne({username})
            if(doesExist){
                await Store.findOneAndUpdate({username},{data:message.content.split('/store')[1]})
                message.reply({
                    content:'saved'
                })
                return
            }
            const data = message.content.split('/store')[1]
            message.channel.sendTyping()
            await saveData(username,data)
            message.reply({
                content:'saved'
            })
        }

        if(message.content.toLowerCase().includes('/get')){
            message.channel.sendTyping()
            const data = await getData(username)
            if(data){
                message.reply({
                    content:data.data
                })
            }else{
                message.reply({
                    content:'No data found'
                })
            }
        }
    } catch (error) {
        console.log(error)
        message.reply({
            content:'I was unable to save the data'
        })
    }
}

module.exports = {
    connectToDB,
    handleStore
}