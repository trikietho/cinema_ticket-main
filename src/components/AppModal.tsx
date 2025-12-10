import type { JSX } from "react"
import { Modal } from "react-bootstrap"


type AppModalProperty = {
    showAdd : boolean,
    onHide: () => void,
    headerText?: string,
    children: JSX.Element
    
}

function AppModal({showAdd, onHide, children, headerText}: AppModalProperty) {
    return (
        <Modal show={showAdd} onHide={onHide}>
                <Modal.Header closeButton>
                    <Modal.Title>{headerText ?? ''}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {children}
                </Modal.Body>
        </Modal>
    )
}
export default AppModal;