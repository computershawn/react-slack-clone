import React from 'react';
import { connect } from 'react-redux';
import { setCurrentChannel } from '../../actions';
import firebase from '../../firebase';
import { Menu, Icon, Modal, Form, Input, Button } from 'semantic-ui-react';

class Channels extends React.Component {
  state = {
    user: this.props.currentUser,
    channels: [],
    channelName: '',
    channelDetails: '',
    channelsRef: firebase.database().ref('channels'),
    modal: false,
    firstLoad: true,
    activeChannel: '',
  }

  componentDidMount() {
    this.addListeners();
  }

  componentWillUnmount() {
    this.removeListeners();
  }

  addListeners = () => {
    let loadedChannels = [];
    this.state.channelsRef.on('child_added', snap => {
      loadedChannels.push(snap.val());
      // console.log(loadedChannels);
      this.setState({channels: loadedChannels}, () => this.setFirstChannel());
    })
  }
  
  removeListeners = () => {
    this.state.channelsRef.off();
  }

  setFirstChannel = () => {
    if(this.state.firstLoad && this.state.channels.length > 0) {
      const firstChannel = this.state.channels[0];
      this.props.setCurrentChannel(firstChannel);
      this.setActiveChannel(firstChannel);
    }
    this.setState({firstLoad: false});
  }

  addChannel = () => {
    const { channelsRef, channelName, channelDetails, user } = this.state;
    const key = channelsRef.push().key;
    const newChannel = {
      id: key,
      name: channelName,
      details: channelDetails,
      createdBy: {
        user: user.displayName,
        avatar: user.photoURL,
      }
    }
    channelsRef
      .child(key)
      .update(newChannel)
      .then(()=>{
        this.setState({ channelName: '', channelDetails: '' });
        this.closeModal();
        // console.log('Added channel!')
      })
      .catch(err => {
        console.error(err);
      })
  }

  displayChannels = channels =>
    channels.length > 0 &&
    channels.map(channel => (
      <Menu.Item
        key={channel.id}
        onClick={()=>this.changeChannel(channel)}
        name={channel.name}
        style={{opacity: '0.7'}}
        active={this.state.activeChannel === channel.id}
      >
      # {channel.name}
      </Menu.Item>
    ));

  changeChannel = channel => {
    this.setActiveChannel(channel);
    this.props.setCurrentChannel(channel);
  }

  setActiveChannel = channel => {
    this.setState({
      activeChannel: channel.id,
    })
  }

  handleSubmit = (event) => {
    event.preventDefault();
    if(this.isFormValid(this.state)) {
      this.addChannel();
    }
  }

  isFormValid = ({channelName, channelDetails}) => channelName && channelDetails;

  closeModal = () => this.setState({ modal: false });
  openModal = () => this.setState({ modal: true });

  handleChange = (event) => {
    this.setState({
      [event.target.name]: event.target.value,
    })
  }

  render() {
    const { channels, modal } = this.state;
    return (
      <React.Fragment>
        <Menu.Menu className="menu">
          <Menu.Item>
            <span>
              <Icon name="exchange" />CHANNELS
            </span>{" "}
            ({channels.length})<Icon name="add" onClick={this.openModal} />
          </Menu.Item>
          {this.displayChannels(channels)}
        </Menu.Menu>

        {/* Add Channel modal */}
        <Modal basic open={modal} onClose={this.closeModal}>
          <Modal.Header>Add a Channel</Modal.Header>
          <Modal.Content>
            <Form onSubmit={this.handleSubmit}>
              <Form.Field>
                <Input
                  fluid
                  label="Name of Channel"
                  name="channelName"
                  onChange={this.handleChange}
                />
              </Form.Field>
              <Form.Field>
                <Input
                  fluid
                  label="About the Channel"
                  name="channelDetails"
                  onChange={this.handleChange}
                />
              </Form.Field>
            </Form>
          </Modal.Content>
          <Modal.Actions>
            <Button color='green' inverted onClick={this.handleSubmit}>
              <Icon name="checkmark" /> Add
            </Button>
            <Button color='red' inverted onClick={this.closeModal}>
              <Icon name="remove" /> Cancel
            </Button>
          </Modal.Actions>
        </Modal>
      </React.Fragment>
    );
  }
}


export default connect(null, { setCurrentChannel })(Channels);