'use strict';

const mongoose = require("mongoose")
let Issue = require("../models/Issue")

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      let project = req.params.project;

        if (Object.keys(req.query).length === 0) {
          try {
          const results = await Issue.find({project_title: project},
          // create specific fields filter https://docs.mongodb.com/manual/reference/method/db.collection.find/
          {
            project_title: 0,
            __v: 0
          })
          if (results.length == 0) {
              return res.json({error: 'No issues for such project!'})
          }

          return res.json(results)  
        } catch (err){
          return res.json({message: err.message})
        }

      } else {
        try {
          const searchQuery = req.query;
          //add project title, otherwise it will return other issues
          searchQuery['project_title'] = project;
          //console.log(searchQuery)

          //look for key values in DB
          const results = await Issue.find(searchQuery)

          // TODO. should pass tests but does not.
          return res.json(results)

        } catch (err) {
          return res.json({message: err.message})
        }
      }

    })
    
    .post(async function (req, res){
      let project = req.params.project;

      // req.body
      let issueTitle = req.body.issue_title,
      issueText = req.body.issue_text,
      createdBy = req.body.created_by,
      assignedTo = req.body.assigned_to,
      statusText = req.body.status_text
      
      if (issueTitle == "" || issueText == "" || createdBy == "" ) {
        return res.json({error: 'required field(s) missing'})
      }

      const issue = new Issue({
        project_title: project,
        issue_title: issueTitle,
        issue_text: issueText,
        created_by: createdBy,
        assigned_to: assignedTo,
        status_text: statusText, 
      })

      try {
        const newIssue = await issue.save()
        //query db to get the data back to show.
        //const issueInfo = await Issue.find({_id: userId})
        //console.log(newIssue)
        res.json({ 
            assigned_to: newIssue.assigned_to,
            status_text: newIssue.status_text,
            open: newIssue.open,
            _id: newIssue.id,
            issue_title: newIssue.issue_title,
            issue_text: newIssue.issue_text,
            created_by: newIssue.created_by,
            created_on: newIssue.created_on,
            updated_on: newIssue.updated_on
          })  
      } catch (err){
        return res.json({error: 'required field(s) missing'})
      }
      
    })
    
    .put(async function (req, res){

      let id = req.body._id

      if (id == null) {
        return res.json({ error: 'missing _id' })
      }

      try {
        id = mongoose.Types.ObjectId(id)
      } catch (err) {
        return res.json({ error: 'could not update', _id: id }) 
      }
  

      // will add all non empty values to this
      let update = {"updated_on": Date.now()};

      //check to close
      const open = req.body.open
      if (open == "true") {
        update["open"] = false;
      }    

      Object.keys(req.body).forEach(key => {
          if (req.body[key] != ""){
            update[key] = req.body[key]
          }
        })

        //console.log(update)

      if (Object.keys(update).length < 3) {
        return res.json({ error: 'no update field(s) sent', _id: id })
      }


      let updatedRecord = await Issue.findByIdAndUpdate(id, 
        update,
        (err, result) => {
          if (!err && result) {
              return res.json({result: 'successfully updated', _id: id})
            } else if (!result) {
              return res.json({ error: 'could not update', _id: id })
            }
              //https://github.com/Automattic/mongoose/issues/5354
        });
    })
    
    .delete(async function (req, res){

      let id = req.body._id

      if (id == null) {
        return res.json({ error: 'missing _id' })
      }

      try {
        const obId = mongoose.Types.ObjectId(id)
      } catch (err) {
        return res.json({ error: 'could not delete', _id: id }) 
      }

      if (Object.keys(req.body).length > 1) {
        return res.json({ error: 'could not delete', _id: id })
      }

      await Issue.findByIdAndRemove(id, (err, result) => {
        if (err) {
          return res.json({ error: 'could not delete', _id: id })
        } else {
          return res.json({ result: 'successfully deleted', _id: id })
        }
      });

      
    });
    
};
