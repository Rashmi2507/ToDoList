//jshint esversion:6

const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const _ = require("lodash");
const date = require(__dirname + "/date.js");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", { useNewUrlParser: true });

const itemSchema = {
  name: String
};

const Item = mongoose.model("Item", itemSchema);

const item1 = new Item({
  name: "Complete the Udemy course"
});

const item2 = new Item({
  name: "Complete LLD"
});

const item3 = new Item({
  name: "Trees Arsh Sheet"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
  name: String,
  items: [itemSchema]
}

const List = mongoose.model("List", listSchema);
app.get("/", function (req, res) {
  
  Item.find({}, function (err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function (err) {
        if (err) {
          console.log("Error");
        }
        else {
          console.log("Successfully inserted the items into DB.");
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listTitle: "Today", newListItems: foundItems});
    }
  })
});

app.get("/:customListItem", function (req, res) {
  const customListItem = _.capitalize(req.params.customListItem);

  List.findOne({ name: customListItem }, function (err, foundList) {
    if (!err) {
      if (!foundList) {
        const list = new List({
          name: customListItem,
          items: defaultItems
        });
      
        list.save();
        res.redirect("/" + customListItem)
      }
      else {
        res.render("list", { listTitle: foundList.name, newListItems: foundList.items });
      }
    }
  });

});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, function (err, foundList) {
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }

  
});

app.post("/delete", function (req, res) {
  const checkboxId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkboxId, function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("checked item got deleted");
      }
    }); 
  }
  else {
    List.findOneAndUpdate({ name: listName }, { $pull: { items: { _id: checkboxId } } }, function (err, foundList) {
      if (!err) {
        res.redirect("/" + listName);
      }
    });
  }
  
});

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
