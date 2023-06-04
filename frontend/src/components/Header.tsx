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
          <NavLink to="/" className="nav-link">
            <Navbar.Brand>HARI</Navbar.Brand>
          </NavLink>
          <Navbar.Toggle aria-controls="navbar-nav" />
          <Navbar.Collapse id="navbar-nav">
            <Nav className="me-auto flex-grow">
              <NavLink to="/" className="nav-link">
                Positions
              </NavLink>
              <NavLink to="/resumes" className="nav-link">
                Resume List
              </NavLink>
              <NavLink to="/upload" className="nav-link">
                Upload CV
              </NavLink>
            </Nav>
            <NavLink to="/settings" className="nav-link">
              Settings
            </NavLink>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};
