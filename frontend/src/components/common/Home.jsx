import React from 'react'
import { Link } from 'react-router-dom'
import { Container, Nav, Button, Navbar } from 'react-bootstrap';

const Home = () => {
   return (
      <>
         <Navbar expand="lg" className="bg-body-tertiary">
            <Container fluid>
               <Navbar.Brand><h2>DocFlow</h2></Navbar.Brand>
               <Navbar.Toggle aria-controls="navbarScroll" />
               <Navbar.Collapse id="navbarScroll">
                  <Nav
                     className="me-auto my-2 my-lg-0"
                     style={{ maxHeight: '100px' }}
                     navbarScroll
                  >
                  </Nav>
                  <Nav>
                     <Link to={'/'}>Home</Link>
                     <Link to={'/login'}>Login</Link>
                     <Link to={'/register'}>Register</Link>
                  </Nav>

               </Navbar.Collapse>
            </Container>
         </Navbar>

         <div id='home-container' className='first-container front'>
            <div className="content-home">
               <p>Your Documents, Your Control: Streamlining<br />Information Flow </p>
               <Link to={'/register'}><Button className='m-2' size='lg'>Track your Doc</Button></Link>
            </div>
         </div>
      </>
   )
}

export default Home

