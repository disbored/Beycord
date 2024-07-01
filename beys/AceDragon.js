const Beyblade=require("./Beyblade.js");
class AceDragon extends Beyblade {
    constructor(e,s){super("Ace Dragon","Attack","https://vignette.wikia.nocookie.net/beyblade/images/4/4e/BBGT_Ace_Dragon_Sting_Charge_Zan_Beyblade.png/revision/latest?cb=20190401120826",e,s),
        this.specials=[{name:"Dragon Shoot",requires:function(e,s,t){return e.sp>3},execute:function(e,s,t){s.hp=s.hp-49;let a=(new Discord.MessageEmbed).setTitle(`[${e.username}] Ace Dragon used **Dragon Shoot**. 49 damage dealt.`).setColor("#551a8b");t.channel.send(a)}}],
        this.passives=[{name:"Break",requires:function(e,s,t){return!1},execute:function(e,s,t){s.hp=s.hp-28;let a=(new Discord.MessageEmbed).setTitle(`Uh oh, [${e.username}] ${e.bey.bbname||e.bey.name} tried to use its passive ability but it was not set up properly. 28 damage dealt.`).setDescription("Please report this at the support server.").setColor("#551a8b");t.channel.createMessage({embed:a})},cd:180}],
        this.modes=[],
        this.sd=0,
        this.sdchangable=!1,
        this.aliases=[]
    }
}

    module.exports=AceDragon;