import React, { useContext, useEffect, useState, useRef } from 'react';
import { styled } from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import axios from 'axios';
import { UserContext } from '../../App';
import Button from '@mui/material/Button';
import { Form, Modal, Col } from 'react-bootstrap';

import JoditEditor from 'jodit-react';
import DOMPurify from 'dompurify';
import pdfMake from 'pdfmake/build/pdfmake';
import pdfFonts from 'pdfmake/build/vfs_fonts';
pdfMake.vfs = pdfFonts.pdfMake.vfs;

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  [`&.${tableCellClasses.head}`]: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  [`&.${tableCellClasses.body}`]: {
    fontSize: 14,
  },
}));

const StyledTableRow = styled(TableRow)(({ theme }) => ({
  '&:nth-of-type(odd)': {
    backgroundColor: theme.palette.action.hover,
  },
  '&:last-child td, &:last-child th': {
    border: 0,
  },
}));

const UserHome = () => {
  const user = useContext(UserContext);
  const editor = useRef(null);
  const [allDocs, setAllDocs] = useState([]);
  const [show, setShow] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [versions, setVersion] = useState([]);
  const [versionHistoryModal, setVersionHistoryModal] = useState({}); // Manage modal visibility per document

  const stripHTMLTags = (html) => {
    return html.replace(/<[^>]*>/g, '');
  };

  const handleClose = () => {
    setShow(false);
    setSelectedDoc(null);
  };

  const handleShow = (docId) => {
    const selected = allDocs.find((doc) => doc._id === docId);
    if (selected) {
      setSelectedDoc(selected);
      setShow(true);
    }
  };

  const handleShowVersionHistory = (docId) => {
    // Toggle version history modal for the given document ID
    setVersionHistoryModal((prev) => ({
      ...prev,
      [docId]: !prev[docId],
    }));
  };

  const getAllBlogs = async () => {
    try {
      const res = await axios.get('/api/user/getalldocs', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.data.success) {
        setAllDocs(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const getVersions = async () => {
    try {
      const res = await axios.get('/api/user/getallversions');
      if (res.data.success) {
        setVersion(res.data.data);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getAllBlogs();
    getVersions();
  }, []);

  const handleUpdateDoc = async (e) => {
    e.preventDefault();
    const sanitizedContent = stripHTMLTags(DOMPurify.sanitize(selectedDoc.content));
    selectedDoc.content = sanitizedContent;
    try {
      const res = await axios.put(`/api/user/updatedoc/${selectedDoc._id}`, selectedDoc, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.data.success) {
        alert(res.data.message);
        handleClose();
        getAllBlogs();
        getVersions();
      } else {
        alert('Something went wrong');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const deleteDoc = async (docId) => {
    try {
      const res = await axios.delete(`/api/user/deletedoc/${docId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      if (res.data.success) {
        alert(res.data.message);
        getAllBlogs();
      } else {
        alert('Something Went Wrong');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  };

  const handleDownload = async (authorName, title, content) => {
    try {
      const fonts = {
        Roboto: {
          normal: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Regular.ttf',
          bold: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Medium.ttf',
          italics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-Italic.ttf',
          bolditalics: 'https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.1.66/fonts/Roboto/Roboto-MediumItalic.ttf',
        },
      };

      pdfMake.fonts = fonts;

      const documentDefinition = {
        content: [
          { text: 'Author Name: ' + authorName, fontSize: 20, bold: true, margin: [0, 0, 0, 10] },
          { text: 'Title: ' + title, fontSize: 16, bold: true, margin: [0, 0, 0, 10] },
          { text: content, fontSize: 12 },
        ],
      };

      const pdfDoc = pdfMake.createPdf(documentDefinition);

      pdfDoc.download('downloaded-document.pdf');
    } catch (error) {
      console.error('An error occurred during download:', error);
    }
  };

  return (
    <TableContainer className="my-5" component={Paper}>
      <Table sx={{ minWidth: 700 }} aria-label="customized table">
        <TableHead>
          <TableRow>
            <StyledTableCell>Doc ID</StyledTableCell>
            <StyledTableCell align="left">Doc Title</StyledTableCell>
            <StyledTableCell align="left">Author Name</StyledTableCell>
            <StyledTableCell align="left">Content</StyledTableCell>
            <StyledTableCell align="left">Action</StyledTableCell>
            <StyledTableCell align="left">Edited by</StyledTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {allDocs.map((doc) => (
            <StyledTableRow key={doc._id}>
              <StyledTableCell component="th" scope="row">
                {doc._id}
              </StyledTableCell>
              <StyledTableCell align="left">{doc.title}</StyledTableCell>
              <StyledTableCell align="left">{doc.authorName}</StyledTableCell>
              <StyledTableCell align="left">
                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  {doc.content}
                </div>
              </StyledTableCell>
              <StyledTableCell align="left">
                {doc.userId === user.userData._id ? (
                  <>
                    <Button size='small' onClick={() => deleteDoc(doc._id)} variant="outlined" color="error">
                      Delete
                    </Button>
                  </>
                ) : null}
                <Button size='small' onClick={() => handleShow(doc._id)} className="m-1" variant="outlined" color="info">
                  Update
                </Button>
                <Button size='small' onClick={() => handleDownload(doc.authorName, doc.title, doc.content)} className="align-center m-1" variant="outlined" color="success">
                  Download
                </Button>
              </StyledTableCell>
              <StyledTableCell align="left">
                <div style={{ maxHeight: '100px', overflowY: 'auto' }}>
                  {doc.editedBy.slice().reverse().map((editor, index) => {
                    const timestamp = new Date(editor.timestamp);
                    const date = `${timestamp.getDate()}-${timestamp.getMonth() + 1}-${timestamp.getFullYear()}`;
                    const hours = timestamp.getHours();
                    const minutes = timestamp.getMinutes();
                    const ampm = hours >= 12 ? 'PM' : 'AM';
                    const formattedHours = hours % 12 || 12;
                    const formattedTimestamp = `${date} ${formattedHours}:${minutes < 10 ? '0' : ''}${minutes} ${ampm}`;

                    const userVersions = versions.filter((version) =>  (version.userId === doc.userId || version.documentId === doc._id));

                    return (
                      <div className='my-1' key={index}>
                        Edit By: {editor.editorName} <br /> Edited On: {formattedTimestamp} <br />
                        {userVersions.length > 0 ? (
                          <p onClick={() => handleShowVersionHistory(doc._id)} style={{ cursor: 'pointer', color: 'blue' }}>Version history</p>
                        ) : (
                          <p style={{ color: 'red' }}>No Version History</p>
                        )}
                        <Modal
                          size="lg"
                          show={versionHistoryModal[doc._id] || false}
                          onHide={() => handleShowVersionHistory(doc._id)} // Close the modal when clicking outside
                          aria-labelledby={`example-modal-sizes-title-${doc._id}`}
                        >
                          <Modal.Header closeButton>
                            <h5>{editor.editorName}&nbsp; Version History</h5>
                          </Modal.Header>
                          <Modal.Body style={{ maxHeight: '200px', overflowY: 'auto' }}>
                            {userVersions.slice().reverse().map((version) => {
                              const timestamp2 = new Date(version.timestamp)
                              const date2 = `${timestamp2.getDate()}-${timestamp2.getMonth() + 1}-${timestamp2.getFullYear()}`;
                              const hours2 = timestamp2.getHours();
                              const minutes2 = timestamp2.getMinutes();
                              const ampm2 = hours2 >= 12 ? 'PM' : 'AM';
                              const formattedHours2 = hours2 % 12 || 12;
                              const formattedTimestamp2 = `${date2} ${formattedHours2}:${minutes2 < 10 ? '0' : ''}${minutes2} ${ampm2}`;
                              return (
                                <div key={version._id}>
                                  <p>Editor Name: {version.editorName}</p>
                                  <p>Doc Title: {version.title}</p>
                                  <p>Doc Content: {version.content}</p>
                                  <p>Time: {formattedTimestamp2}</p>
                                  <hr />
                                </div>
                              );
                            })}
                          </Modal.Body>
                        </Modal>
                        <hr />
                      </div>
                    );
                  })}
                </div>
              </StyledTableCell>
            </StyledTableRow>
          ))}
        </TableBody>
      </Table>
      <Modal size="lg" show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{selectedDoc?.authorName}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleUpdateDoc}>
            <Form.Group as={Col} md="12" controlId="validationCustom01">
              <Form.Label>Title</Form.Label>
              <Form.Control
                required
                type="text"
                placeholder="enter title"
                name="title"
                value={selectedDoc?.title || ''}
                onChange={(e) => setSelectedDoc({ ...selectedDoc, title: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="my-3" as={Col} md="12" controlId="validationCustomUsername">
              <Form.Label>Content</Form.Label>
              <JoditEditor
                ref={editor}
                value={selectedDoc?.content || ''}
                onChange={(value) => setSelectedDoc({ ...selectedDoc, content: value })}
              />
            </Form.Group>
            <Button className="mx-1" variant="outlined" color="error" onClick={handleClose}>
              Close
            </Button>
            <Button type="submit" variant="outlined" color="success">
              Save Changes
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </TableContainer>
  );
};

export default UserHome;

