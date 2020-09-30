import React from "react";
import Protected from "./Protected";
import Public from "./Public";
import netlifyIdentity from "netlify-identity-widget";
import {
  BrowserRouter as Router,
  Route,
  Link,
  Redirect,
  withRouter,
} from "react-router-dom";

// copied straight from https://reacttraining.com/react-router/web/example/auth-workflow
////////////////////////////////////////////////////////////
// 1. Click the public page
// 2. Click the protected page
// 3. Log in
// 4. Click the back button, note the URL each time

const BASE_URI = "/.netlify/functions";
const URI = {
  HELLO: `${BASE_URI}/hello`,
};

function AuthExample() {
  return (
    <Router>
      <div>
        <button
          onClick={() => {
            netlifyIdentity.refresh().then((jwt) => console.log(jwt));
          }}
        >
          Refresh JWT
        </button>
        <AuthButton />
        <ul>
          <li>
            <Link to="/public">Public Page</Link>
          </li>
          <li>
            <Link to="/protected">Protected Page</Link>
          </li>
        </ul>
        <Route path="/public" component={Public} />
        <Route path="/login" component={Login} />
        <PrivateRoute path="/protected" component={Protected} />
      </div>
    </Router>
  );
}

const netlifyAuth = {
  isAuthenticated: () => (netlifyIdentity.currentUser() ? true : false),
  user: () => netlifyIdentity.currentUser(),
  authenticate(callback) {
    netlifyIdentity.open();
    netlifyIdentity.on("login", (user) => {
      this.user = user;
      netlifyIdentity.close();
      callback(user);
    });
  },
  signout(callback) {
    netlifyIdentity.logout();
    netlifyIdentity.on("logout", () => {
      this.user = null;
      callback();
    });
  },
};

const AuthButton = withRouter(({ history }) =>
  netlifyAuth.isAuthenticated() ? (
    <p>
      Welcome!{" "}
      <button
        onClick={() => {
          netlifyAuth.signout(() => history.push("/"));
        }}
      >
        Sign out
      </button>
    </p>
  ) : (
    <p>You are not logged in.</p>
  )
);

function PrivateRoute({ component: Component, ...rest }) {
  return (
    <Route
      {...rest}
      render={(props) =>
        netlifyAuth.isAuthenticated() ? (
          <Component {...props} />
        ) : (
          <Redirect
            to={{
              pathname: "/login",
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
}

class Login extends React.Component {
  state = { redirectToReferrer: false };

  handleErrors = (response) => {
    if (!response.ok) {
      throw Error(response.statusText);
    }
    return response.json();
  };

  generateAuthHeader = (body, method = "GET") => {
    const token =
      netlifyAuth.user().token && netlifyAuth.user().token["access_token"];
    const modified_header = {
      method,
      body: body ? JSON.stringify(body) : null,
      headers: {
        Authorization: `Bearer avopsjrepfjser;goserjg;oijo;i${token}awfewefawwec;lokfoapwoejfoiwjoi`,
      },
    };
    return modified_header;
  };

  componentDidMount() {
    if (netlifyAuth.isAuthenticated()) {
      console.log("User", netlifyAuth.user());
      fetch(URI.HELLO, this.generateAuthHeader(null))
        .then(this.handleErrors)
        .then((res) => console.log("Function Res", res))
        .catch((err) => console.log("ERR:", err));
    } else {
      console.log("Not authenticated, so cannot call netlify functions");
    }
  }

  login = () => {
    netlifyAuth.authenticate(() => {
      this.setState({ redirectToReferrer: true });
    });
  };

  render() {
    let { from } = this.props.location.state || { from: { pathname: "/" } };
    let { redirectToReferrer } = this.state;

    if (redirectToReferrer) return <Redirect to={from} />;

    return (
      <div>
        <p>You must log in to view the page at {from.pathname}</p>
        <button onClick={this.login}>Log in</button>
      </div>
    );
  }
}
export default AuthExample;
