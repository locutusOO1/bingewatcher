import React, { Component } from "react";
import Container from "./Container";
import Row from "./Row";
import Col from "./Col";
import Card from "./Card";
import SearchForm from "./SearchForm";
import axios from "axios";
import { withRouter } from "react-router";
import searchStyles from "./searchStyles.css";
import { Button } from 'react-bootstrap';
import "bootstrap/dist/css/bootstrap.min.css";

var uid = -1;

class Search extends Component {
  state = {
    result: [{}],
    search: ""
  };

  componentDidMount() {
    const urlParams = new URLSearchParams(window.location.search);
    for (var pair of urlParams.entries()) {

      if (pair[0] === "uid") {
        uid = pair[1];
      }
    }

  }

  async searchTVshows(value) {
    this.setState({ result: [] })
    await axios.get("https://episodate.com/api/search?q=" + value)
      .then(res => {

        const tvShowFound = res.data.tv_shows;

        const tvId = tvShowFound.map(result => result.id)
        for (let i = 0; i < tvId.length; i++) {
          this.searchDetail(tvId[i]);
        }
      })
      .catch(err => console.log(err));
  };
  handleInputChange = event => {
    const value = event.target.value;
    const name = event.target.name;


    this.setState({
      [name]: value
    });
  };

  // When the form is submitted, search the Episodate API for the value of `this.state.search`
  handleFormSubmit = event => {
    event.preventDefault();
    this.searchTVshows(this.state.search);
  };

  reDirecttoProfile = () => {
    this.props.history.push("/Profile?uid=" + uid)
  }

  async saveToList({ result }) {
    result.UserId = uid;


    //  Here is where I call the API and then I need to create a post/create method
    // in that file.
    await axios.post("/api/add_tv_show",
      {
        tvShowID: result.id,
        name: result.name,
        description: result.description,
        image: result.image_path,
        runtime: result.runtime,
        numOfEpisodes: (result.episodes.length === 0) ? 1 : result.episodes.length,
        rating: result.rating,
        genre: result.genres.join(','),
        UserId: uid
      })
      .then(res => {
        console.log(res);
      })
      .catch(err => {
        console.log(err);

      });


  }


  async searchDetail(id) {
    var newArray = this.state.result;


    await axios.get("https://episodate.com/api/show-details?q=" + id)
      .then(res => {
        const description = res.data.tvShow.description.replace(/(<([^>]+)>)/gi, "");
        res.data.tvShow.description = description;
        newArray.push(res.data.tvShow)
        this.setState({ result: newArray })

      })
  }

  render() {
    const result = this.state.result;




    return (
      <Container>
        <Row>
          <Col size="md-8">
            <Card 
              heading={this.state.result.tv_shows || "Search for a TV show to Begin"}
            >
              {this.state.result.length > 1 ? (
                <div className="text-center">
                  <ul className="list-group search-results">
                    {result.map(result => (
                      <>
                        <h3 className="search-text">{result.name}</h3>
                        <li key={result.id} className="list-group-item">
                          <p className="regular-text">{result.description}</p>
                          <img src={result.image_thumbnail_path} />
                          <br />
                          <br />
                          <Button className="button-pink" onClick={() => this.saveToList({ result })}>Save</Button>
                        </li>
                      </>))}
                  </ul>
                </div>
              ) : (
                  <h3 className="regular-text">No Results to Display</h3>
                )}
            </Card>
            <br />
            <Button className="button-pink" onClick={this.reDirecttoProfile}>Back to Profile</Button>
          </Col>
          <Col size="md-4">
            <Card heading="Search">
              <SearchForm className="search-text"
                value={this.state.search}
                handleInputChange={this.handleInputChange}
                handleFormSubmit={this.handleFormSubmit}
              />
            </Card>
          </Col>
        </Row>
      </Container>
    );
  }
}

export default withRouter(Search);
