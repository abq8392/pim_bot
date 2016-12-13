var Botkit = require('botkit');
var userData = require('./userData.js');


module.exports = {

    // Command: '/Create'. Create a new personal pofile on pim_bot
    create: function(controller, bot, message) {
        if (message.channel_id[0] != 'D') {
            bot.replyPrivate(message, '請在私訊頻道(Direct messages)使用這個功能喔！');
        } else {
        	//console.log(JSON.stringify(message));
            bot.replyPrivate(message, 'Hello! 歡迎使用創建個人檔案功能，你可以隨時輸入 `exit!` 離開');
            var profile = {
                gender: "", // "male", "female", "other"
                birthday: "", // "1995-12-12"
                nationality: "", // "Taiwan"
                living_country: "", // "Taiwan"
                living_city: "", // "Taiwan"
                occupation: "" // "student"
            };

            askGender = function(response, convo) {
                convo.ask('請輸入性別 (male, female, other):', function(response, convo) {
                    convo.say('OK, 你的性別是 「' + response.text + '」');
                    askNation(response, convo);
                    convo.next();
                });
            }
            askNation = function(response, convo) {
                convo.ask('請輸入國籍(例如：Taiwan):', function(response, convo) {
                    convo.say('OK, 你的國籍是: ' + response.text);
                    askBirth(response, convo);
                    convo.next();
                });
            }
            askBirth = function(response, convo) {
                convo.ask('請輸入你的生日： (格式：1990-12-12)', function(response, convo) {
                    var res = convo.extractResponses();
                    var get_date = res['請輸入你的生日： (格式：1990-12-12)']; // The string of date
                    convo.say('OK, 你的生日是:' + get_date);
                    askLivingCountry(response, convo);
                    convo.next();
                });
            }
            askLivingCountry = function(response, convo) {
                convo.ask('請輸入居住國家(例如：Taiwan):', function(response, convo) {
                    var res = convo.extractResponses();
                    convo.say('OK! 你的居住國家為: ' + response.text);
                    askLivingCity(response, convo);
                    convo.next();
                });
            }
            askLivingCity = function(response, convo) {
                convo.ask('請輸入居住縣市（例如：Taipei）', function(response, convo) {
                    var res = convo.extractResponses();
                    convo.say('OK! 你的居住縣市為：' + response.text);
                    askOccupation(response, convo);
                    convo.next();
                });
            }
            askOccupation = function(response, convo) {
                var res = convo.extractResponses(response);
                convo.ask('請輸入你的職業（例如：student）', function(response, convo) {
                	convo.say('OK! 你的職業是：' + response.text);
                    convo.next();
                });

                /* When the conversation end */
                convo.on('end', function(convo) {
                    if (convo.status == 'completed') {
                    	var res = convo.extractResponses();

                        profile.gender = res['請輸入性別 (male, female, other):'];
                        profile.birthday = res['請輸入你的生日： (格式：1990-12-12)'];
                        profile.nationality = res['請輸入國籍(例如：Taiwan):'];
                        profile.living_country = res['請輸入居住國家(例如：Taiwan):'];
                        profile.living_city = res['請輸入居住縣市（例如：Taipei）'];
                        profile.occupation = res['請輸入你的職業（例如：student）'];

                        //pollCase.addCase(controller, bot, detail);
                        userData.addCase(controller, bot, message.user_id, profile);
                    }
                });
            }
            bot.startConversation(message, askGender);
        }
    },

    show: function(controller, bot, message){
    	console.log("Enter the function of showing personal profile");
    	controller.storage.users.get(message.user, function(err, user){
    		//bot.replyPrivate("你的個人檔案如以下所示：");
    		
    		if(!user || !user.hasOwnProperty('details')){
    			bot.replyPrivate(" Sorry, 你還未建立個人檔案！");
    		} else {
    			var data = {
    				text: '（只有你會看到此項訊息）',
    				attachments: [{
    					fallback: '你的個人檔案資訊',
    					title: '你的個人檔案資訊',
    					text:'',
    					color: '#F35A00'
    				}],
    			}

    			data.attachments[0].text = 
    			"性別：" + user.details.gender +'\n'+
    			"生日：" + user.details.birthday+ '\n'+
    			"國籍：" + user.details.nationality+ '\n'+
    			"居住國家：" + user.details.living_country+ '\n'+
    			"居住城市：" + user.details.living_city+ '\n'+
    			"職業：" + user.details.occupation+ '\n';

    			bot.replyPrivate(message, data);
    			
    		}

    	});
    }

}