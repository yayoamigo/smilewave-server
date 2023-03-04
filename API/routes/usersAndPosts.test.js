const request = require("supertest");
const app = require("../index");
const mongoose = require("mongoose");
const User = require("../models/User");
const Post = require("../models/Post");

// Connect to MongoDB using the URL stored in the environment variable
mongoose.connect(
    process.env.MONGO_URL,
    { useNewUrlParser: true, useUnifiedTopology: true },
    () => {
        console.log("connected to Mongo");
    }
);


describe("User routes", () => {
    let user;
  
    beforeAll(async () => {
        // Create a test user
        user = await User.create({
            username: "testuser",
            email: "testuser@example.com",
            password: "testpassword",
        });
    });

    afterAll(async () => {
        // Delete the test user
        await User.findByIdAndDelete(user._id);
    });

    describe("Post routes", () => {
        let post;
    
        beforeEach(async () => {
            // Create a test post
            post = await Post.create({
                userId: user._id,
                desc: "test description",
            });
        });

        afterEach(async () => {
            // Delete the test post
            await Post.findByIdAndDelete(post._id);
        });

        it("should create a post", async () => {
            const res = await request(app)
                .post("/api/posts")
                .send({
                    userId: user._id,
                    desc: "test description",
                });
            expect(res.statusCode).toEqual(200);
            expect(res.body.desc).toEqual("test description");
        });
  
      it("should update a post", async () => {
        const res = await request(app)
          .put(`/api/posts/${post._id}`)
          .send({
            userId: user._id,
            desc: "updated description",
          });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual("the post has been updated");
        const updatedPost = await Post.findById(post._id);
        expect(updatedPost.desc).toEqual("updated description");
      });
  
      it("should delete a post", async () => {
        const res = await request(app)
          .delete(`/api/posts/${post._id}`)
          .send({
            userId: user._id,
          });
        expect(res.statusCode).toEqual(200);
        expect(res.text).toEqual("\"the post has been deleted\"");
        const deletedPost = await Post.findById(post._id);
        expect(deletedPost).toBeNull();
      });
  
      it("should like a post", async () => {
        const res = await request(app)
          .put(`/api/posts/${post._id}/like`)
          .send({
            userId: user._id,
          });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toEqual("The post has been liked");
        const likedPost = await Post.findById(post._id);
        expect(likedPost.likes).toEqual(expect.arrayContaining([user._id.toString()]));
      });
    
      it("should get a post by ID", async () => {
        const res = await request(app).get(`/api/posts/${post._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.desc).toEqual(post.desc);
    });

    it("should get timeline posts", async () => {
        const res = await request(app).get(`/api/posts/timeline/${user._id}`);
        expect(res.statusCode).toEqual(200);
        expect(res.body.length).toEqual(2);
        expect(res.body[0].desc).toEqual(post.desc);
    }); 
});
}); 