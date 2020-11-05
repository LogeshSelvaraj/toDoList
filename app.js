//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _=require("lodash")
const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connecting mongoose
mongoose.connect("mongodb+srv://Logeshksr99:Logeshksr99@cluster0.bhy7i.mongodb.net/todolistDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
})

// schema for list items
const listSchema = new mongoose.Schema({
    work: {
        type: String,
        required: true
    }
})

// model for list items
const listItem = new mongoose.model("listItem", listSchema)

// items to insert
const item1 = new listItem({
    work: "Eat"
})

const item2 = new listItem({
    work: "Wash clothes"
})

const item3 = new listItem({
    work: "study"
})

const itemArray = [item1, item2, item3]

//schema and model for custom list
const customListSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    items: {
        type: [listSchema]
    }
})
const customList = new mongoose.model("list", customListSchema)


// get routers
app.get("/", function (req, response) {


    listItem.find({}, {work: 1, _id: 1}, function (err, res) {


        if (err) {
            console.log(err)
        } else {
            if (res.length === 0) {

                listItem.insertMany(itemArray, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        response.redirect("/")
                    }
                })

            } else {

                response.render("list", {listTitle: "Today", newListItems: res});
            }
        }
    })
});


// adding items post request
app.post("/", function (req, res) {

    const item = req.body.newItem;
    const listName =req.body.list;
    const newListItem = new listItem({
        work: item
    })

    if (listName === "Today") {
        if (item) {
            newListItem.save()
            res.redirect("/")
        }
    } else {
        if (item) {

            customList.findOne({name: listName}, function (err, foundList) {

                foundList.items.push(newListItem)
                foundList.save()
                res.redirect("/" + listName)
            })
        }
    }

});

// post request for checkbox
app.post("/checkbox", function (req, res) {
    const id = req.body.checkbox
    console.log(id)
    const listTitle=req.body.listTitle
    if(listTitle==="Today") {
        listItem.findByIdAndRemove(id, function (err) {
            if (err)
                console.log(err)
            else {
                console.log("removed successfully")
                res.redirect("/")
            }
        })
    }
    else{
        customList.findOneAndUpdate({name:listTitle},{$pull:{items:{_id:id}}},function (err) {
            if(!err){
                res.redirect("/"+listTitle)
            }

        })
    }

})


//custom list routers
app.get("/:title", function (req, res) {
    const listTitle=_.capitalize(req.params.title)
    customList.findOne({name: listTitle}, {name: 1, _id: 0, items: 1}, function (err, foundItems) {
        if (!foundItems) {
            const newCustomList = new customList({
                name: listTitle,
                items: itemArray
            })
            newCustomList.save()
            res.redirect("/" + listTitle)
        } else {
            res.render("list", {listTitle: foundItems.name, newListItems: foundItems.items})
        }
    })

})


app.get("/work", function (req, res) {
    res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function (req, res) {
    res.render("about");
});

app.listen(3000, function () {
    console.log("Server started on port 3000");
});