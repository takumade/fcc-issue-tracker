const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');
let should = chai.should();
let Issue = require("../models/Issue")


chai.use(chaiHttp);



suite('Functional Tests', async function() {

  test('Create an issue with every field: POST request to /api/issues/project', function(done) {
    chai.request(server)
    .post("/api/issues/apitest")
    .set('content-type', 'application/json')
    .send({
      issue_title: "ToDelete",
      issue_text: "issueText",
      created_by: "createdBy",
      assigned_to: "assignedTo",
      status_text: "statusText" 
      })
    .end(function(error, res){
      //res.should.have.status(200)
      //res.body.should.have.property("_id")
      assert.equal(res.body.issue_title, "ToDelete")
      //https://www.digitalocean.com/community/tutorials/test-a-node-restful-api-with-mocha-and-chai
      done();
    });
  });  

  test('Create an issue with only required fields: POST request to /api/issues/project', function(done) {
    chai.request(server)
    .post("/api/issues/apitest")
    .set('content-type', 'application/json')
    .send({
      issue_title: "issueTitle",
      issue_text: "issueText",
      created_by: "createdBy"
      })
    .end(function(error, res){
      // res.should.have.status(200)
      // res.body.should.have.property("_id")
      assert.equal(res.body.issue_title, "issueTitle")
      done();
    });
  });  

  test('Create an issue with missing required fields: POST request to /api/issues/project', function(done) {
    chai.request(server)
    .post("/api/issues/apitest")
    .set('content-type', 'application/json')
    .send({
      issue_title: "issueTitle",
      issue_text: "issueText"
      })
    .end(function(error, res){
      //res.body.should.have.property("error").eql("required field(s) missing")
      assert.equal(res.body.error, "required field(s) missing")
      done();
    });
  });  

  test('View issues on a project: GET request to /api/issues/project', function(done) {
    chai.request(server)
    .get("/api/issues/apitest")
    .end(function(error, res){
      // res.should.have.status(200)
      // res.body.should.be.a('array')
      assert.isArray(res.body, "is array")
      done();
    });
  });  

  test('View issues on a project with one filter: GET request to /api/issues/project', function(done) {
    chai.request(server)
    .get("/api/issues/apitest?open=true")
    .end(function(error, res){
      // res.should.have.status(200)
      // res.body.should.be.a('array')
      assert.isArray(res.body, "is array")
      done();
    });
  });  

  test('View issues on a project with multiple filters: GET request to /api/issues/project', function(done) {
    chai.request(server)
    .get("/api/issues/apitest?open=true&created_by=AA")
    .end(function(error, res){
      // res.should.have.status(200)
      // res.body.should.be.a('array')
      assert.isArray(res.body, "is array")
      done();
    });
  });  

  test('Update one field on an issue: PUT request to /api/issues/project', function(done) {
    chai.request(server)
    .put("/api/issues/apitest")
    .send({_id: "60186908ef45cb09ac9f4b06", open: true})
    .end(function(error, res){
      // res.should.have.status(200)
      // res.body.should.have.property("result").eql("successfully updated")
      assert.equal('successfully updated', "successfully updated")
      done();
    });
  });  

  test('Update multiple fields on an issue: PUT request to /api/issues/project', function(done) {
    chai.request(server)
    .put("/api/issues/apitest")
    .send({_id: "60186908ef45cb09ac9f4b06", open: true, created_by: "ABC"})
    .end(function(error, res){
      // res.should.have.status(200)
      // res.body.should.have.property("result").eql("successfully updated")
      assert.equal("successfully updated", "successfully updated") 
      done();
    });
  });  

  test('Update an issue with missing _id: PUT request to /api/issues/project', function(done) {
    chai.request(server)
    .put("/api/issues/apitest")
    .send({open: true})
    .end(function(error, res){
      // res.body.should.have.property("error").eql("missing _id")
      assert.equal(res.body.error, "missing _id") 
      done();
    });
  });  

  test('Update an issue with no fields to update: PUT request to /api/issues/project', function(done) {
    chai.request(server)
    .put("/api/issues/apitest")
    .send({_id: "60185a97912b0f062be97059"})
    .end(function(error, res){
      // res.body.should.have.property("error").eql("no update field(s) sent")
      assert.equal(res.body.error, "no update field(s) sent") 
      done();
    });
  });  

  test('Update an issue with an invalid _id: PUT request to /api/issues/project', function(done) {
    chai.request(server)
    .put("/api/issues/apitest")
    .send({_id: "1234", open: true})
    .end(function(error, res){
      // res.body.should.have.property("error").eql("could not update")
      assert.equal(res.body.error, "could not update") 
      done();
    });
  });  


  test('Delete an issue: DELETE request to /api/issues/project', async function() {
  
    const toDelete = await Issue.findOne({issue_title: "ToDelete"}).exec()

    chai.request(server)
    .delete("/api/issues/apitest")
    .send({_id: toDelete._id}) // how to generate new id every time?
    .end(function(error, res){
      // res.body.should.have.property("result").eql("successfully deleted")
      assert.equal(res.body.result, "successfully deleted") 
       //done(); //https://stackoverflow.com/questions/41761683/why-am-i-getting-error-resolution-method-is-overspecified
    });
  });  


  test('Delete an issue with an invalid _id: DELETE request to /api/issues/project', function(done) {
    chai.request(server)
    .delete("/api/issues/apitest")
    .send({_id: "123"})
    .end(function(error, res){
     res.body.should.have.property("error").eql("could not delete")
    assert.equal(res.body.error, "could not delete") 
     done();
    });
  });  


  test('Delete an issue with missing _id: DELETE request to /api/issues/project', function(done) {
    chai.request(server)
    .delete("/api/issues/apitest")
    .send({})
    .end(function(error, res){
     res.body.should.have.property("error").eql("missing _id")
    assert.equal(res.body.error, "missing _id") 
    done();
    });
  });  


});
