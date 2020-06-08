const express=require('express');
const bodyParser=require('body-parser');
const app=express();
const mongoose=require('mongoose');
let match=true;
let id,a=[];
var flg=0;

var nodemailer = require('nodemailer');

var transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: 'invitationmakers1234@gmail.com',
    pass: 'invitedelta'
  }
});
// Require google from googleapis package.
const { google } = require('googleapis')

// Require oAuth2 from our google instance.
const { OAuth2 } = google.auth

// Create a new instance of oAuth and set our Client ID & Client Secret.
const oAuth2Client = new OAuth2(
  '70912515046-l3hk895o1652egrr6ua5pniod70edqk9.apps.googleusercontent.com',
  'uDC1CxY7q5OsG1ptSgN2BqiG'
)

// Call the setCredentials method on our oAuth2Client instance and set our refresh token.
oAuth2Client.setCredentials({
  refresh_token: '1//04hIKGN6Cu3RdCgYIARAAGAQSNwF-L9IrejZ7bkivughQvjdMX19vwDk5LrMRJBSaHSSflEZT9IwgC7L4NkGxwkbnhGy9nUYT34A',
})

// Create a new calender instance.
const calendar = google.calendar({ version: 'v3', auth: oAuth2Client })

mongoose.connect('mongodb://localhost:27017/maindb', {useNewUrlParser: true})
app.set('view engine','ejs');
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static('public'));
const userSchema= new mongoose.Schema({
    username:String,
    pwd:String,
    events:Array,
    email:String
})
const inviteSchema =new mongoose.Schema({
    name:String,
    invitation:String,
    eventType:String,
    invitees:Array,
    time:String,
    date:String,
    guests:Array,
    secGuests:Number,
    food:Array
})
function deadline(date,time){
    var d= new Date();
    var idate=new Date(date+' '+time);
    if(d.getTime()<=idate.getTime()){
        return true;
    }
    else{
        return false;

    }
}
const User =new mongoose.model('user',userSchema);
const Invite =new mongoose.model('invite',inviteSchema);
app.get('/',function(req,res){
    res.render('home',{});
})
app.get('/signup',function(req,res){
res.render('signup',{});
})

app.get('/signin',function(req,res){
    res.render('signin',{found:match});
})
app.get('/userpage/:name',function(req,res){
    src="https://ui-avatars.com/api/?name="+req.params.name+"&rounded=true&bold=true&size=128&background=ededed&color=272727"

    Invite.find({invitees:{$elemMatch:{$in:req.params.name}}},function(err,ar){
    if(err){
        console.log(err);      
    }        
    else{
        User.find({username:req.params.name},function(err,arr){
            
            res.render('userpage',{name:req.params.name,link:src,invites:ar,evt:arr[0],cond:true});
        })
            
    }
    })
})
app.get('/create/:name',function(req,res){
    
    res.render("invite",{host:req.params.name});
})
app.get('/users',function(req,res){
    a=[];
    User.find({},function(err,arr){
        if(err){
            console.log(err);
        }
        else{
            for(var i=0;i<arr.length;i++){
                var obj={
                    userName:arr[i].username,
                    password:arr[i].pwd,
                    email:arr[i].email
                }
                a.push(obj);
            }
            res.send(a);
        }
    })
});
app.get('/invites/:name',function(req,res){
    let a=[];
    console.log(req.params.name);
    
    Invite.find({invitees:{$elemMatch:{$in:req.params.name}}},function(err,arr){
        for(var i=0;i<arr.length;i++){
            var obj={
                name:arr[i].name,
                msg:arr[i].invitation
            }
            a.push(obj);
        }
        console.log(arr);
        res.send(arr);
 
    })
    // console.log(a);
    
});

app.get('/schedule/:name',function(req,res){
    User.findOne({username:req.params.name},function(err,obj){
        if(err){
            console.log(err);
            
        }
        else{
            res.send(obj);
        }
    })
})
app.get('/myevts/:name',function(req,res){
    Invite.find({name:req.params.name},function(err,arr){
        if(err){
            console.log(err);
            
        }
        else{
            res.send(arr);
        }
    })
})
app.get('/result/:id/:name',function(req,res){

    res.render('result',{id:req.params.id,name:req.params.name});
})
app.get('/busy/:name',function(req,res){
    link="/userpage/"+req.params.name;
    res.render('resbusy',{link:link});
})
app.get('/sendemail/:id/:cond',function(req,res){
    console.log(typeof(req.params.cond));
    c=req.params.cond==='true'
        Invite.findOne({_id:req.params.id},function(err,obj){
            if(err){
                console.log(err);
            }
            else{
                
                res.render('email',{accept:obj.guests,decline:obj.invitees,id:'/send/'+req.params.id,display:c});
            }
        })
    
})
app.post('/',function(req,res){
    user=new User({
        username:req.body.userName,
        pwd:req.body.password,
        email:req.body.email,
        events:[]
    });
    User.find({username:req.body.userName},function(err,arr){
       
        if(!(arr.length>1)){
            console.log('saved');
            
            user.save();
        }
        
    })
    res.redirect('signin')
    })
app.post('/signin',function(req,res){
    match=true;
    User.find({username:req.body.userName},function(err,arr){
        if(err){
            console.log(err);
            
        }
        else{
            if(arr.length>0){
                if(arr[0].pwd===req.body.password){
                    res.redirect('/userpage/'+req.body.userName);
                    console.log('signed in');
                    
                }
                else{
                    math=false;
                    res.redirect('/signin')
                }
            }
            else{
                match=false;
                res.redirect('/signin')
            }
        }
    })
})
app.post('/details',function(req,res){
    console.log(req.body);
    a=req.body.submit.split(",");
Invite.updateOne({_id:a[0]},{$inc:{secGuests:req.body.number},$push:{food:req.body.food}},function(err,succ){
    if(err){
        console.log(err);
        
    }
    else{
        console.log(succ);
        res.redirect('/userpage/'+a[1])
        
    }
})

})
app.post('/send/:id',function(req,res){
a=(req.body.submit.split(','));
console.log(a);

Invite.findOne({_id:req.params.id},function(err,object){
    for(var i=0;i<a.length-1;i++){
        User.findOne({username:a[i]},function(err,obj){
            s=obj.email
            var mailOptions = {
                from: "invitationmakers1234@gmail.com",
                to: s,
                subject: 'invitation',
                html: object.invitation
              };
                                  
             transporter.sendMail(mailOptions, function(error, info){
             if (error) {
             console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
              
            }
            });
                        
        })
        if(i===(a.length-2)){
            res.redirect('/sendemail/'+req.params.id+'/true')
          }
    }
})


})
app.post('/invitations',function(req,res){
    if(req.body.type==='1'){
        s="<div class='container' id='invitation'>\
        <h2 id='eventName'>Happy Birthday!!!</h2>\
        <div class='container'>\
          <p id='evtDesc'>"+req.body.content+"</p>\
          <h4 id='venue'>"+req.body.venue+"</h4>\
          <h4 id='date'>"+req.body.date+"</h4>\
          <h4 id='timing'>"+req.body.time+"</h4>\
        </div>\
      </div>"

    }
    if(req.body.type==='2'){
        s="<div class='container' id='invitation'>\
        <h2 id='eventName'>Wedding Invitation</h2>\
        <div class='container'>\
          <p id='evtDesc'>"+req.body.content+"</p>\
          <h4 id='venue'>"+req.body.venue+"</h4>\
          <h4 id='date'>"+req.body.date+"</h4>\
          <h4 id='timing'>"+req.body.time+"</h4>\
        </div>\
      </div>"

    }
    if(req.body.type==='3'){
        s="<div class='container' id='invitation'>\
        <h2 id='eventName'>Memorial Celebration</h2>\
        <div class='container'>\
          <p id='evtDesc'>"+req.body.content+"</p>\
          <h4 id='venue'>"+req.body.venue+"</h4>\
          <h4 id='date'>"+req.body.date+"</h4>\
          <h4 id='timing'>"+req.body.time+"</h4>\
        </div>\
      </div>"

    }

    invite= new Invite({
        name:req.body.host,
        invitation:s,
        eventType:req.body.type,
        invitees:req.body.guests.split(','),
        time:req.body.time,
        date:req.body.date,
        guests:[],
        food:[],
        secGuests:0
        
    })
    invite.save();
    res.redirect('/userpage/'+req.body.host)
})
app.post('/email',function(req,res){
    let s='';
    res.redirect('/sendemail/'+req.body.submit+'/false');
})
app.post('/guest',function(req,res){
a=req.body.accept.split(',');
console.log(a);
if(a[0]==='true'){

    
    Invite.findOne({_id:a[1]},function(err,obj){
        //google calendar event 
        if(obj.eventType==='1'){
            summ='Birthday Party of'+obj.name
        }
        if(obj.eventType==='2'){
            summ='Wedding Anniversary of'+obj.name
        }
        if(obj.eventType==='3'){
            summ='Memorial Event hosted by'+obj.name
        }
        var eventStartTime= new Date(obj.date+' '+obj.time);
        var eventEndTime = new Date(eventStartTime);
        eventEndTime.setMinutes(eventEndTime.getMinutes()+60);
        const event = {
            summary: summ,
            location: `3595 California St, San Francisco, CA 94118`,
            description: `To get involved with guests and make a good connection`,
            colorId: 1,
            start: {
              dateTime: eventStartTime,
              timeZone: 'Asia/Calcutta',
            },
            end: {
              dateTime: eventEndTime,
              timeZone: 'Asia/Calcutta',
            },
          }
          // Check if we a busy and have an event on our calendar for the same time.
calendar.freebusy.query(
    {
      resource: {
        timeMin: eventStartTime,
        timeMax: eventEndTime,
        timeZone: 'Asia/Calcutta',
        items: [{ id: 'primary' }],
      },
    },
    (err, resp) => {
      // Check for errors in our query and log them if they exist.
      if (err) return console.error('Free Busy Query Error: ', err)
  
      // Create an array of all events on our calendar during that time.
      const eventArr = resp.data.calendars.primary.busy
  
      // Check if event array is empty which means we are not busy
      if (eventArr.length === 0)
        // If not busy create a new calendar event.
        return calendar.events.insert(
          { calendarId: 'primary', resource: event },
          err => {
            // Check for errors and log them if they exist.
            if (err) return console.error('Error Creating Calender Event:', err)
            // Else log that the event was created.
            else{
                Invite.updateOne({_id:a[1]},{$push:{guests:a[2]}},function(err,succ){
                    if(err){
                        console.log(err);
                        
                    }
                    else{
                        console.log(succ);
                        
                    }
                })
                Invite.updateOne({_id:a[1]},{$pull:{invitees:a[2]}},function(err,suc){
                    if(err){
                        console.log(err);
                        
                    }
                    else{
                        console.log(suc);
                        
                    }
                })
            
                User.updateOne({username:a[2]},{$push:{events:obj}},function(err,succ){
                    if(err){
                        console.log(err);
                        
                    }
                    else{
                        console.log(succ);
                        
                    }
                })
            flg=1
            res.redirect('/result/'+obj.id+'/'+a[2]);
            return console.log('Calendar event successfully created. flg:',flg)
            }
          }
        )
  
      // If event array is not empty log that we are busy.
      flg=0;
      res.redirect('/busy/'+a[2])
    return console.log(`Sorry I'm busy...`)
    }
  )
  console.log(flg);


    })
    
    
}
else{
    res.redirect('/userpage/'+a[2])
}
})
app.listen(3000,function(){
    console.log("server started in port 3000");
    
})