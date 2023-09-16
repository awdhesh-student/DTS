import { useState, useRef } from 'react';
import { Button, Col, Form, Row } from 'react-bootstrap';
import JoditEditor from 'jodit-react';
import DOMPurify from 'dompurify';
import axios from 'axios';

function AddDoc() {
  const editor = useRef(null)
  const [validated, setValidated] = useState(false);

  const [doc, setDoc] = useState({
    title: '',
    authorName: '',
    content: ''
  })

  const handleChange = (name, value) => {
    setDoc({ ...doc, [name]: value });
  };

  const stripHTMLTags = (html) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const handleSubmit = async (e) => {
    const form = e.currentTarget;
    if (form.checkValidity() === false) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    const sanitizedContent = stripHTMLTags(DOMPurify.sanitize(doc.content));

    doc.content = sanitizedContent;

    try {
      const res = await axios.post('/api/user/postdocument', doc, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      if (res.data.success) {
        alert(res.data.message);
      } else {
        alert('Something went wrong');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }

    setValidated(true);
  };


  return (
    <div className='m-5'>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Row className="mb-3">
          <Form.Group as={Col} md="6" controlId="validationCustom01">
            <Form.Label>Title</Form.Label>
            <Form.Control
              required
              type="text"
              placeholder="enter title"
              name='title'
              value={doc.title}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group as={Col} md="6" controlId="validationCustom02">
            <Form.Label>Author name</Form.Label>
            <Form.Control
              required
              type="text"
              name='authorName'
              value={doc.authorName}
              onChange={(e) => handleChange(e.target.name, e.target.value)}
            />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          </Form.Group>
          <Form.Group className='my-3' as={Col} md="12" controlId="validationCustomUsername">
            <Form.Label>Content</Form.Label>
            <JoditEditor
              ref={editor}
              value={doc.content}
              onChange={(value) => handleChange('content', value)} // Handle JoditEditor content change separately
            />
          </Form.Group>
        </Row>
        <div className='text-center'>

          <Button type="submit">Submit Doc</Button>
        </div>
      </Form>
    </div>
  );
}

export default AddDoc;
