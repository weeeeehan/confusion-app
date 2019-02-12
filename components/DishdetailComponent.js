import React, { Component } from 'react';
import { View, Text, ScrollView, FlatList, Modal, Button, Alert, PanResponder, Share } from 'react-native';
import { Card, Icon, Rating, Input } from 'react-native-elements';
import { connect } from 'react-redux';
import { baseUrl } from '../shared/baseUrl';
import { postFavorite, postComment } from '../redux/ActionCreators';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
});

function RenderDish(props) {
    const dish = props.dish;

    handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({ moveX, moveY, dx, dy }) => {
        if (dx < -200) 
            return true;
        else
            return false;
    };

    const rightSwipe = ({ moveX, moveY, dx, dy }) => {
        if (dx > 200)
            return true;
        else
            return false;
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
            this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add to Favorites?',
                    'Are you sure you wish to add ' + dish.name + ' to favorites?',
                    [
                        {
                            text: 'Cancel',
                            onPress: () => console.log('Cancel pressed'),
                            style: 'cancel'
                        },
                        {
                            text: 'OK',
                            onPress: () => props.favorite ? console.log('Already Favorite') : props.onPress()
                        }
                    ],
                    { cancelable: false }
                )
            else if (rightSwipe(gestureState))
                props.toggle()
            return true;
        }
    });

    const shareDish = (title, message, url) => {
        Share.share({
            title: title,
            message: title + ': ' + message + ' ' + url,
            url: url
        }, {
            dialogTitle: 'Share ' + title
        });
    }

    if (dish != null) {
        return(
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                ref={this.handleViewRef}
                {...panResponder.panHandlers}>
                <Card
                    featuredTitle={dish.name}
                    image={{ uri: baseUrl + dish.image }}
                    >
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center'}}>
                        <Icon
                            raised
                            reverse
                            name={ props.favorite ? 'heart' : 'heart-o' }
                            type='font-awesome'
                            color='#f50'
                            onPress={() => props.favorite ? console.log('Already Favorite') : props.onPress() } />
                        <Icon
                            raised
                            reverse
                            name='pencil'
                            type='font-awesome' 
                            color='#512DA8'
                            onPress={() => props.toggle()}
                            />
                        <Icon
                            raised
                            reverse
                            name='share'
                            type='font-awesome' 
                            color='#51D2A8'
                            onPress={() => shareDish(dish.name, dish.description, baseUrl + dish.image)}
                            />
                    </View>
                </Card>
            </Animatable.View>
        );
    }
    else {
        return(<View></View>);
    }
}

function RenderComments(props) {
    const comments = props.comments;

    const renderCommentItem = ({ item, index }) => {
        return(
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating
                    type='star'
                    imageSize={10}
                    readonly
                    startingValue={item.rating}
                    style={{ alignItems: 'flex-start' }}
                    />
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date}</Text>
            </View>
        );
    }

    return(
        <Animatable.View animation="fadeInUp" duration={2000} delay={1000}>
            <Card title="Comments">
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()} />
            </Card>
        </Animatable.View>
    );
}

class Dishdetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rating: 1,
            author: '',
            comment: '',
            showModal: false
        }
    }

    toggleModal() {
        this.setState({ showModal: !this.state.showModal })
    }

    handleSubmit() {
        console.log(this.props.navigation.getParam('dishId', ''), this.state.rating, this.state.author, this.state.comment)
        this.props.postComment(this.props.navigation.getParam('dishId', ''), this.state.rating, this.state.author, this.state.comment)
        this.toggleModal()
    }

    markFavorite(dishId) {
        this.props.postFavorite(dishId)
    }

    static navigationOptions = {
        title: 'Dish Details'
    }

    render() {
        const dishId = this.props.navigation.getParam('dishId', '')
        return(
            <ScrollView>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                    favorite={this.props.favorites.some(el => el === dishId)}
                    onPress={() => this.markFavorite(dishId)}
                    toggle={() => this.toggleModal()}
                     />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)} />
                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => {this.toggleModal()}}
                    onRequestClose={() => {this.toggleModal()}}
                    >
                    <ScrollView>
                        <View style={{ alignItems: 'center' }}>
                            <Rating
                                showRating
                                ratingCount={5}
                                type="star"
                                fractions={0}
                                startingValue={5}
                                onFinishRating={(rating) => this.setState({ rating: rating})}
                                />
                        </View>
                        <View style={{ flexDirection: 'row', paddingLeft: 20}}>
                            <Icon
                                name='user'
                                type='font-awesome'
                                />
                            <Input 
                                placeholder='Author'
                                onChangeText={(value) => this.setState({ author: value })}
                                />
                        </View>
                        <View style={{ flexDirection: 'row', paddingLeft: 20}}>
                            <Icon
                                name='comment'
                                type='font-awesome'
                                />
                            <Input 
                                placeholder='Comment'
                                onChangeText={(value) => this.setState({ comment: value })}
                                />
                        </View>
                        <Button 
                            onPress={() => {this.handleSubmit()}}
                            color='#512DA8'
                            title='Submit'
                            />
                    </ScrollView>
                </Modal>
            </ScrollView>
        );
    }
}

export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);