import { method } from "cypress/types/bluebird";

describe("Test with backend", () => {
  beforeEach("login to the app", () => {
    cy.intercept(
      { method: "Get", path: "tags" },
      {
        fixture: "tags.json",
      }
    );

    cy.loginToApp();
  });

  it("verify correct request and response", () => {
    cy.intercept("POST", Cypress.env("apiUrl") + "/api/articles/").as(
      "postArticles"
    );

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("This is the titleq");
    cy.get('[formcontrolname="description"]').type("This is a description");
    cy.get('[formcontrolname="body"]').type("This is a body of the article");
    cy.contains("Publish Article").click();

    cy.wait("@postArticles").then((xhr) => {
      console.log(xhr);
      expect(xhr["response"].statusCode).to.equal(200);
      expect(xhr["request"].body.article.body).to.equal(
        "This is a body of the article"
      );
      expect(xhr["response"].body.article.description).to.equal(
        "This is a description"
      );
    });
  });

  it("intercepting and modifying the request and response", () => {
    // cy.intercept("POST", Cypress.env("apiUrl") + "/api/articles/", (req) => {
    //   req.body.article.description = "This is a description2"
    // }).as(
    //   "postArticles"
    // );

    cy.intercept("POST", Cypress.env("apiUrl") + "/api/articles/", (req) => {
      req.reply((res) => {
        expect(res.body.article.description).to.equal("This is a description");
        res.body.article.description = "This is a description2"
      });
    }).as("postArticles");

    cy.contains("New Article").click();
    cy.get('[formcontrolname="title"]').type("This is the titlep");
    cy.get('[formcontrolname="description"]').type("This is a description");
    cy.get('[formcontrolname="body"]').type("This is a body of the article");
    cy.contains("Publish Article").click();

    cy.wait("@postArticles").then((xhr) => {
      console.log(xhr);
      expect(xhr.response.statusCode).to.equal(200);
      expect(xhr.response.body.article.body).to.equal(
        "This is a body of the article"
      );
      expect(xhr["response"].body.article.description).to.equal(
        "This is a description2"
      );
    });
  });

  it("verify popular tags are displayed", () => {
    cy.log("we logged in");
    cy.get(".tag-list")
      .should("contain", "cypress")
      .and("contain", "automation")
      .and("contain", "testing");
  });

  it("verifies article like count increases", () => {
    cy.intercept("GET", "**/articles/feed*", {
      articles: [],
      articlesCount: 0,
    });
    cy.intercept("GET", "**/articles*", { fixture: "articles.json" });

    cy.contains("Global Feed").click();
    cy.get("app-article-list button").then((likeButtons) => {
      cy.wrap(likeButtons).first().contains("1");
      expect(likeButtons[1]).contain("5");
    });

    cy.fixture("articles").then((file) => {
      const articleId = file.articles[1].slug;
      file.articles[1].favoritesCount = 6;
      cy.intercept(
        "POST",
        Cypress.env("apiUrl") + "/api/articles/" + articleId + "/favorite",
        file
      );
    });

    cy.get("app-article-list button").eq(1).click().should("contain", "6");
  });

  it.only("post a new article", {retries: 2, browser: ["!edge", "!opera"]}, () => {
    const bodyRequest = {
      "article": {
        "tagList": [],
        "title": "Request from Apia",
        "description": "API testing is good",
        "body": "React is cool"
      }
    }

    cy.get("@token").then(token => {
      cy.request({
        url: Cypress.env("apiUrl") + "/api/articles/",
        headers: {"Authorization": "Token " + token},
        method: "POST",
        body: bodyRequest
      }).then(response => {
        expect(response.status).to.equal(200)
      })
    })

  })



});
