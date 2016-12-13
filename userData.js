var Botkit = require('botkit');

module.exports = {

    addCase: function(controller, bot, new_user, profile) {
        controller.storage.users.get(new_user, function(err, user) {
            if (!user) {
                user = {
                    id: new_user,
                    details: profile
                }
            } else if(!user.hasOwnProperty('details')){
            	user['details'] = profile;                
            } else {
            	bot.startPrivateConversation({ user: new_user }, function(err, convo) {
                    if (err) {
                        console.log(err);
                    } else {
                        convo.say('你已經建立了你的個人檔案。若要修改請輸入指令： /update');
                    }
                });
            }
            
            controller.storage.users.save(user);
        });
    }

}