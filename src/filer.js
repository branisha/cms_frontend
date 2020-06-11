import React from 'react';
import './App.css';
import './file.css';
import $ from "jquery";

import { ContextMenu, MenuItem, ContextMenuTrigger } from "react-contextmenu";

class FileName extends React.Component {
    render() {
        return (<span className="fileName">{this.props.value}</span>);
    }
}

class FileNameInput extends React.Component {

    componentDidMount() {
        this.nameInput.focus();
    }

    render() {
        return (<input className="nameInput" onKeyPress={this.props.onKeyPress} onBlur={this.props.onBlur} ref={(input) => { this.nameInput = input; }} value={this.props.value} onChange={this.props.onChange}></input>);
    }
}

class File extends React.Component {

    constructor(props) {
        super(props);

        this.reload = props.reloadData;

        this.state = {
            originalValue: this.props.obj.fileName,
            value: this.props.obj.fileName,
            editing: false,
        }

    }

    mergeWithState() {
        return Object.assign({}, this.props.obj, this.state);
    }

    handleDownload = (e) => {
        fetch("http://192.168.5.25:9000/testAPI/download", {
            method: 'POST', 
            mode: 'cors',
            cache: 'no-cache', 
            credentials: 'same-origin', 
            headers: {
                'Content-Type': 'application/json'
            },
            redirect: 'follow',
            referrerPolicy: 'no-referrer', 
            body: JSON.stringify(this.state)
        }).then(pp => pp.blob()).then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;


            a.download = this.state.originalValue;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        });
    };

    handleChange = (e) => {
        this.setState({ value: e.target.value });
    };

    handleBlur = (e) => {

        this.setState({ editing: false }, () => {
            // send rename
            $.ajax({
                type: "POST",
                url: 'http://localhost:9000/testAPI/rename',
                dataType: 'json',
                data: JSON.stringify(Object.assign({}, this.props.obj, this.state)),
                contentType: 'application/json; charset=utf-8',
                success: function (data) {
                    this.setState({ originalValue: this.state.value });
                }.bind(this),
                error: function (xhr, status, err) {
                    console.log("Err happend");
                    console.error(this.props.url, status, err.toString());
                }.bind(this)
            });
        });

    }

    handleKeyPress = (e) => {
        if (e.key == 'Enter') {
            this.handleBlur(null);
        }
    };

    handleClick = (e, data) => {
        this.setState({ editing: true });
    }

    handleDoubleClick = (e) => {
        $.ajax({
            type: "POST",
            url: 'http://192.168.5.25:9000/testAPI/files',
            dataType: 'json',
            cache: false,
            data: JSON.stringify(this.props.obj),
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                console.log("Success")
                console.log(data);
                this.props.updateFolder(data);
                // this.reload();
                $('.test').append(data);
            }.bind(this),
            error: function (xhr, status, err) {
                console.log("Err happend");
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });

    }

    handleDelete = (e) => {

        $.ajax({
            type: "POST",
            url: 'http://localhost:9000/testAPI/delete',
            dataType: 'json',
            cache: false,
            data: JSON.stringify(this.mergeWithState()),
            contentType: 'application/json; charset=utf-8',
            success: function (data) {
                this.props.updateFolder(data);
            }.bind(this),
            error: function (xhr, status, err) {
                console.log("Err happend");
                console.error(this.props.url, status, err.toString());
            }.bind(this)
        });
    }


    render() {
        const fileName = this.props.editable ? <FileNameInput onChange={this.handleChange} onKeyPress={this.handleKeyPress} value={this.state.value} onBlur={this.handleBlur}></FileNameInput> : <FileName value={this.state.value}></FileName>;

        const isDir = this.props.obj.isDir;

        const dblClickAction = isDir ? this.handleDoubleClick.bind(this) : null;

        return (

            <div className={"file-div" + (this.props.isSelected ? " file-selected" : "")} onClick={(e) => this.props.selectObject(e, this.props.obj)} onDoubleClick={dblClickAction}>
                <ContextMenuTrigger id={this.props.obj.fileName}>

                    <img className="slika" src={this.props.obj.icon} />

                    {fileName}

                </ContextMenuTrigger>
                <ContextMenu className="menu" id={this.props.obj.fileName}>
                    <MenuItem
                        onClick={this.handleDownload}
                        data={{ item: fileName }}
                        className="menuItem"
                    >
                        Download
                        </MenuItem>

                    <MenuItem
                        onClick={this.handleClick}
                        data={{ item: fileName }}
                        className="menuItem"
                    >
                        Rename
                    </MenuItem>
                    <MenuItem
                        onClick={this.handleDelete}
                        data={{ item: "Home" }}
                        className="menuItem"
                    >
                        Delete
                    </MenuItem>
                </ContextMenu>
            </div>
        );
    }
}


class HeaderButton extends React.Component {

    static _counter = 0;

    constructor(props) {
        super(props);
    }

    static getNextId() {
        return HeaderButton._counter++;
    }

    render() {
        return (<button className="control-header-button" onClick={this.props.action}>{this.props.value}</button>);
    }
}

class Header extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            buttons: this.props.buttons || [],
        }

    }

    componentDidMount() {

        let buttons = [{ action: () => { alert("Action not implemented; use right-click on white space") }, value: "upload" }, { action: () => { console.log("Action not implemented") }, value: "New dir" }]

        this.addButtons(buttons);

    }

    addButtons(buttonsArray) {
        this.setState({ buttons: buttonsArray });

    }

    addButton(action, button) {
        let buttonsCopy = [...this.state.buttons];
        buttonsCopy.push({ action: action, value: button });
    }

    render() {
        return (
            <div className="control-header">
                {this.state.buttons.map(x => <HeaderButton key={HeaderButton.getNextId()} action={x.action} value={x.value}></HeaderButton>)}

                {this.props.files.length == 1 &&
                    <HeaderButton key={HeaderButton.getNextId()} action={this.props.renameFile} value="Rename"></HeaderButton>
                }

            </div>
        );
    };
}

class Filer extends React.Component {

    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);

        this.state = {
            files: props.files,
            editable: props.files.map(() => false)
        }

    }

    deleteObject(){

    }

    deleteMultipleObjects(){

    }

    renameFile(){
        let obj = this.getSelectedObjects()[0];
        if(obj){
            for(let i = 0; i < this.state.files.length; i++){
                if(this.state.files[i] == obj){
                    let editCopy = [...this.state.editable];
                    editCopy[i] = true;
                    this.setState({editable: editCopy});
                    break;
                }
            }
        }
    }

    componentDidUpdate(pProps) {

        if (pProps === this.props) {
            return;
        }
        
        this.setState({ files: this.props.files });

    }

    selectObject(e, obj) {
        let filesCopy = [...this.state.files];

        for(let i = 0; i < filesCopy.length; i++){
            if(filesCopy[i] == obj){
                filesCopy[i].isSelected = !filesCopy[i].isSelected;
                this.setState({files: filesCopy});
                break;
            }
        }
    }

    getSelectedObjects(){
        return this.state.files.filter(f => f.isSelected);
    }

    getEditableObjects(){
        return this.state.editable.some(true);
    }

    handleClick(e) {
        this.refs.fileUploader.click();
    }

    onSubmit(e) {

        function progress(e) {
            if (e.lengthComputable) {
                var max = e.total;
                var current = e.loaded;

                var Percentage = (current * 100) / max;
                console.log(Percentage);

                if (Percentage >= 100) {
                    console.log("Finished")
                }
            }
        }

        var _formData = new FormData(e.target.form);

        var formData = new FormData();
        formData.append("name", this.props.files[0].filePath);

        for (var pair of _formData.entries()) {
            formData.append(pair[0], pair[1]);
        }

        $.ajax({
            type: 'POST',
            url: 'http://localhost:9000/testAPI/upload',
            data: formData,
            xhr: function () {
                var myXhr = $.ajaxSettings.xhr();
                if (myXhr.upload) {
                    myXhr.upload.addEventListener('progress', progress, false);
                }
                return myXhr;
            },
            cache: false,
            contentType: false,
            processData: false,

            success: function (data) {

                this.props.updateFolder(data);

            }.bind(this),

            error: function (data) {
                console.log(data);
                console.log("Err");
            }
        });
    }

    render() {
        return (
            <div className="filer-div">
                <Header files={this.getSelectedObjects()} renameFile={this.renameFile.bind(this)}></Header>
                <div className="main-part">
                    <ContextMenuTrigger id="context">
                        {this.state.files.map((x, i) => <File editable={this.state.editable[i]} changeFolder={this.changeFolder} updateFolder={this.props.updateFolder} key={x.fileName} obj={x} reloadData={this.props.reloadData} isSelected={x.isSelected} selectObject={this.selectObject.bind(this)}></File>)}

                        <form method="post" action="uploadImages.php" name='photo' id='imageuploadform' encType="multipart/form-data">

                            <input onChange={this.onSubmit.bind(this)} hidden="{true}" ref="fileUploader" id="fileupload" type="file" name="image[]" multiple />

                        </form>


                    </ContextMenuTrigger>
                    <ContextMenu className="menu" id="context">
                        <MenuItem
                            onClick={this.handleClick}
                            className="menuItem"
                        >
                            Upload
                    </MenuItem>
                    </ContextMenu>
                </div>
            </div>
        );
    }
}

export default Filer;