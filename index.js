require('dotenv').config();
require("log-node")();
var log = require("log");
log = log.get("attendance-service-pulse");
var mqtt = require('mqtt');
var os = require( 'os' );
var fs = require('fs');
const axios = require('axios');

const MQTT_SERVER = process.env.MQTT_SERVER;
const API_ENDPOINT = process.env.API_ENDPOINT
const CONFIG_ENDPOINT = process.env.CONFIG_ENDPOINT
const CONFIG_FILE_NAME = "config-entrance.json"

let client
let configEntrance= [
	        {topic:'inpulse/dt/pulses/Pulso078/tag-id',event:'entrada'},
	        {topic:'inpulse/dt/pulses/Pulso082/tag-id',event:'entrada'},
	        {topic:'inpulse/dt/pulses/Pulso089/tag-id',event:'entrada'},
	        {topic:'inpulse/dt/pulses/Pulso102/tag-id',event:'entrada'},
	        {topic:'inpulse/dt/pulses/Pulso106/tag-id',event:'entrada'}
	    ]


function initialize(){
	log.info("Initializing...")
	client  = mqtt.connect(MQTT_SERVER)

	client.on('connect', function () {
		log.get("mqtt").debug('connected.',MQTT_SERVER)
	})

	client.on('reconnect', function () {
		log.get("mqtt").debug('reconnecting.')
	})

	client.on('error', function (error) {
		log.get("mqtt").error('error.',error)
	})

	client.on('message', function (topic, message) {
		processMessage(topic,message.toString())
	})

	
	axios.get(CONFIG_ENDPOINT, {timeout: 15000 }).then(res => {
		log.debug("config entrance:",res.data)
		configEntrance = res.data;
		var stream = fs.createWriteStream(CONFIG_FILE_NAME);
		stream.write(JSON.stringify(configEntrance));
		stream.end()
		subscribeToTopics()
	})
	.catch(error => {
	
		log.debug("error retrieving config: code",error.code)
		//log.debug("error retrieving config: response",error.response)
		try{
			log.debug("retrieving from file:")
			if(fs.existsSync(CONFIG_FILE_NAME)){
				var stream = fs.createReadStream(CONFIG_FILE_NAME);
				stream.on('data', function (chunk) {
					let content = chunk.toString()
				    log.debug("config from file:",content)
				    
				    configEntrance = JSON.parse(content)
				    log.debug("config OK!:",configTags)
				    subscribeToTopics()
				})
			}else{
				//default config
				subscribeToTopics()
			}
		}catch(e){
		    log.error("error parsing config file",e)
		    subscribeToTopics()
		};
		
		
	})
	log.info("Initialized...")
}

function subscribeToTopics(){
	log.info('subscribing to topics')
	configEntrance.forEach(config=>{
		client.subscribe(config.topic, function (err) {
	    	if (!err) {
	    		log.info('subscribed to topic:',config.topic);
	   		}else{
	   			log.error('error subscribing to topic:',err);
	   		}
	  	})
	})
}

function processMessage(topic, message){
    log.debug('message on reader ' + message)
    try{
    	const cmd = JSON.parse(message)
		cmd.id_lectora = topic
		let config = configEntrance.find(function(element){
			if(element.topic == topic){
				return true
			}else{
				return false
			}
		})
		cmd.event_type = config.event
		log.debug(cmd)
		axios.post(API_ENDPOINT, cmd ,{timeout: 15000 }).then(res => {
			log.debug("res:",res.data)
		})
		.catch(error => {
			log.error('error writing to api',error)
		})
    }catch(err){
      log.error('err',err)
    }
}

initialize()