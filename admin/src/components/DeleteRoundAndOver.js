import React, { useState } from 'react';
import { Button, Card, Form, Alert } from 'react-bootstrap';

export default function DeleteRoundAndOver({ socket }) {
  const [inputPassword, setInputPassword] = useState('');
  const [showDeleteBtn, setShowDeleteBtn] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handlePasswordChange = (e) => {
    setInputPassword(e.target.value);
    setShowError(false);
  };

  const handleCheckPassword = () => {
    if (inputPassword === '12345678') {
      setShowDeleteBtn(true);
    } else {
      setShowDeleteBtn(false);
      setShowError(true);
    }
  };

  const handleDelete = () => {
    setLoading(true);
    setTimeout(() => {
      socket.emit('deleteOver');
      setLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
      }, 2000);
    }, 1500);
  };

  return (
    <Card bg="dark" text="white" className="mb-2 border-danger">
      <Card.Header className="text-center bg-danger text-white">
        <h5>Danger Zone</h5>
      </Card.Header>
      <Card.Body>
        <Form>
          <Form.Group controlId="password">
            <Form.Label>Enter Password to Delete  All History</Form.Label>
            <Form.Control
              type="password"
              value={inputPassword}
              onChange={handlePasswordChange}
              placeholder="Enter password"
              className="mb-3"
            />
            {showError && (
              <Alert variant="danger" className="text-center">
                Wrong password. Please try again.
              </Alert>
            )}
            {showSuccess && (
              <Alert variant="success" className="text-center">
                Successfully deleted all rounds and overs.
              </Alert>
            )}
          </Form.Group>
          <div className="d-grid gap-2">
            <Button variant="outline-warning" onClick={handleCheckPassword} size="lg">
              Unlock
            </Button>
            {showDeleteBtn && (
              <Button variant="danger" onClick={handleDelete} size="lg" className="mt-3">
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : (
                  <i className="fas fa-trash-alt me-2"></i>
                )}
                Delete Round and Over
              </Button>
            )}
          </div>
        </Form>
      </Card.Body>
    </Card>
  );
}
