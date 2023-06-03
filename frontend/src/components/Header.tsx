import React, { FC, ReactElement } from "react";
import { NavLink } from "react-router-dom";
import Container from "react-bootstrap/Container";
import Nav from "react-bootstrap/Nav";
import Navbar from "react-bootstrap/Navbar";

export const Header: FC<any> = (): ReactElement => {
  return (
    <header>
      <Navbar bg="info" expand="md">
        <Container>
          <Navbar.Brand>HARI</Navbar.Brand>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto flex-grow">
              <NavLink to="/" className="nav-link">
                Home
              </NavLink>
              <NavLink to="/upload" className="nav-link">
                Upload CV
              </NavLink>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};
