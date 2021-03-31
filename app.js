//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const ejs= require("ejs");
const mongoose = require("mongoose");
const _ =require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema=new mongoose.Schema({
  name: {
    type:String,
    required:[true,"no name specified"]
  }

});



const Item=mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "wlcome to our list"
})

const item2 = new Item({
  name: "Hit + button to enter data"
})

const item3 = new Item({
  name: "delete the item from list"
})

defaultItems=[item1, item2, item3]

//creating new schema
const listSchema = {
  name : String,
  items: [itemSchema]
};

const List = mongoose.model("List", listSchema);



app.get("/", function(req, res) {

  Item.find({}, function(err,findItems){
//we added if...else   as it is compulsary/default we will keep those first 3 values there
    if(findItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log(err);
        }
        else{
          console.log("Successfully submitted");
        }
      });

      res.redirect("/");
    }
    else{
    res.render("list", {listTitle:"Today", newListItems: findItems});
    }
  });

});


app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  //console.log(itemList);
  const itemList = new Item({
    name : itemName
  });
  if(listName === "Today")
  {
    itemList.save();
  res.redirect("/");
  }else{
    List.findOne({name : listName}, function(err, foundList){
      foundList.items.push(itemList);
      foundList.save();
      res.redirect("/" + listName );
    });
  }

});



app.post("/delete", function(req,res){

  const checkedItemId=req.body.checkBox;
  const listValue=req.body.listName;

 if(listValue == "Today"){
  Item.findByIdAndRemove(checkedItemId, function(err){
    if(err){
      console.log(err);
    }
    else{
      console.log("Successfully deleted from the database");
        res.redirect("/");
    }
  });
}
else{
  List.findOneAndUpdate({name : listValue}, {$pull:{items : {_id:checkedItemId}}}, function(err, foundList){
    if(!err){

    res.redirect("/" + listValue);
    }
  });
}


});

//create any custom route
app.get("/:customList", function(req,res){
  const customListName = _.capitalize( req.params.customList);

  List.findOne({name: customListName},function(err, foundList){
    if(!err){
      if(!foundList){
        //"Not exist"
        const list = new List({
          name:customListName,
          items : defaultItems
        });

        list.save();
        res.redirect("/" + customListName);
      }
      else{
        //"exist"
        res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
      }
    }
  });



});

app.get("/about", function(req, res){
  res.render("about");
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function() {
  console.log("Server started Successfullly");
});
