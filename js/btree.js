class Event{
    constructor(type,values) {
        this.type = type;
        this.values = values;
    }
}

let newlyInsertedKey;


class Tree{
    constructor(order){
        this.order = order;
        this.root = new Node();
        this.height = 1;
        this.eventList = [];
    }

    getLeftNeighborNode(node){
        if(node.parent!=null){
            for(var i=0; i<node.parent.children.length; i++){
                if(node == node.parent.children[i]){
                    if((i-1) >= 0){
                        return node.parent.children[i-1];
                    } else{
                        return null;
                    }
                }
            }
        }
    }

    getRightNeighborNode(node){
        if(node.parent!=null){
            for(var i=0; i<node.parent.children.length; i++){
                if(node == node.parent.children[i]){
                    if((i+1) < node.parent.children.length){
                        return node.parent.children[i+1];
                    } else{
                        return null;
                    }
                }
            }
        }
    }

    deleteValue(value, nodeToCheck){
        var node = this.findNode(value, nodeToCheck);
        if(node==null){
            console.log('Value does not exist in Tree.');
        } else{

            // If Leaf
            if(node.isLeaf()){

                // No Underflow
                if(node.keys.length > this.order){
                    for(var i=0; i<node.keys.length; i++){
                        if(value == node.keys[i]){
                            this.eventList.push(new Event("deleteInLeafNoUnderflow",JSON.parse(JSON.stringify(node.keys))));
                            node.keys.splice(i, 1);
                        }
                    }
                }

                // Underflow
                else if(node.keys.length == this.order){

                    // Underflow and NeighborNode (left or right) has k+1 -> Rotate
                    var leftNeighborNode = this.getLeftNeighborNode(node);
                    var rightNeighborNode = this.getRightNeighborNode(node);

                    // If Underflow and left NeighborNode has k+1, steal value from left neighborNode
                    if(leftNeighborNode!=null && leftNeighborNode.keys.length>this.order){

                        for(var i=0; i<node.parent.children.length; i++){
                            if(node == node.parent.children[i]){
                                for(var j=0; j<node.keys.length; j++){
                                    if(value == node.keys[j]){
                                        node.keys.splice(j, 1);
                                    }
                                }
                                let neighborValues = [];
                                for(let i = 0; i < leftNeighborNode.keys.length; i++){
                                    neighborValues.push(leftNeighborNode.keys[i]);
                                }
                                this.eventList.push(new Event("rotateWithLeftNeighbor",[JSON.parse(JSON.stringify(leftNeighborNode.keys[leftNeighborNode.keys.length-1])),neighborValues,JSON.parse(JSON.stringify(node.parent.keys[i-1]))]));
                                node.insertKey(node.parent.keys[i-1], this.order);
                                node.parent.keys[i-1] = leftNeighborNode.keys[leftNeighborNode.keys.length-1];
                                leftNeighborNode.keys.splice(leftNeighborNode.keys.length-1, 1);
                            }
                        }
                    // If Underflow and left NeighborNode has not k+1, but right NeighborNode has k+1, steal value from right neighborNode
                    } else if(rightNeighborNode!=null && rightNeighborNode.keys.length>this.order){

                         for(var i=0; i<node.parent.children.length; i++){
                            if(node == node.parent.children[i]){
                                for(var j=0; j<node.keys.length; j++){
                                    if(value == node.keys[j]){
                                        node.keys.splice(j, 1);
                                    }
                                }
                                let neighborValues = [];
                                for(let i = 0; i < rightNeighborNode.keys.length; i++){
                                    neighborValues.push(rightNeighborNode.keys[i]);
                                }

                                this.eventList.push(new Event("rotateWithRightNeighbor",[JSON.parse(JSON.stringify(rightNeighborNode.keys[0])),neighborValues,JSON.parse(JSON.stringify(node.parent.keys[i]))]));
                                node.insertKey(node.parent.keys[i], this.order);
                                node.parent.keys[i] = rightNeighborNode.keys[0];
                                rightNeighborNode.keys.splice(0, 1);
                            }
                        }
                    }


                    // Underflow and both NeighborNodes have not k+1 -> Take value from ParentNode in deleted Node (Merge)
                    else{
                        // If there is a left NeighborNode, merge with it
                        if(leftNeighborNode!=null){
                            for(var i=0; i<node.parent.children.length; i++){
                                if(node == node.parent.children[i]){
                                    for(var j=0; j<node.keys.length; j++){
                                        if(value == node.keys[j]){
                                            node.keys.splice(j, 1);
                                        }
                                    }
                                    this.eventList.push(new Event("mergeWithLeftNeighbor",[JSON.parse(JSON.stringify(leftNeighborNode.keys)), JSON.parse(JSON.stringify(node.parent.keys)), JSON.parse(JSON.stringify(node.keys))]));
                                    node.insertKey(node.parent.keys[i-1], this.order);
                                    node.parent.keys.splice(i-1, 1);
                                    
                                    for(var j=0; j<node.keys.length; j++){
                                        leftNeighborNode.insertKey(node.keys[j], this.order);
                                    }
                                    node.parent.children.splice(i, 1);
                                }
                            }
                            if(node.parent.keys.length==0 && node.parent.parent==null){
                                leftNeighborNode.parent = null;
                                this.root = leftNeighborNode;
                            }
                        // If there is not left NeighborNode, but a right one, merge with the right Node
                        } else if(rightNeighborNode!=null){

                            for(var i=0; i<node.parent.children.length; i++){
                                if(node == node.parent.children[i]){
                                    for(var j=0; j<node.keys.length; j++){
                                        if(value == node.keys[j]){
                                            node.keys.splice(j, 1);
                                        }
                                    }
                                    this.eventList.push(new Event("mergeWithRightNeighbor",[JSON.parse(JSON.stringify(rightNeighborNode.keys)),JSON.parse(JSON.stringify(node.parent.keys)),JSON.parse(JSON.stringify(node.keys))]));
                                    node.insertKey(node.parent.keys[i], this.order);
                                    node.parent.keys.splice(i, 1);
                                    
                                    for(var j=0; j<node.keys.length; j++){
                                        rightNeighborNode.insertKey(node.keys[j], this.order);
                                    }

                                    node.parent.children.splice(i, 1);
                                }
                            }
                            if(node.parent.keys.length==0 && node.parent.parent==null){
                                rightNeighborNode.parent = null;
                                this.root = rightNeighborNode;
                            }
                        }
                        // If Parent has < k values because of merge, it gets values from neighbor or parent
                        if(node.parent) {
                            if (node.parent.keys.length < this.order) {
                                this.handleUnderflowInParent(node.parent);
                            }
                        }else{
                            node.keys = [];
                            this.eventList.push(new Event("deletingLastTreeElement", []));
                        }


                        node = null;
                    }
                }
            } 
            // If Node has Children
            else{
                this.deleteValueInNode(value, node);
            }
        }
    }

    returnAllChildrenKeys(node, values){
        for(let i = 0; i < node.children.length; i++){
            values.push(node.children[i].keys);
            if(node.children[i].children != null){
                this.returnAllChildrenKeys(node.children[i],values);
            }
        }
    }
    handleUnderflowInParent(node){
        // NeighborNode (left or right) has k+1
        var leftNeighborNode = this.getLeftNeighborNode(node);
        var rightNeighborNode = this.getRightNeighborNode(node);

        if(leftNeighborNode!=null && leftNeighborNode.keys.length>this.order){
            let neighborValues = [];
            let childrenValues = [];
            for(let i = 0; i < leftNeighborNode.keys.length; i++){
                neighborValues.push(leftNeighborNode.keys[i]);
            }
            this.returnAllChildrenKeys(leftNeighborNode,childrenValues);
            this.returnAllChildrenKeys(node,childrenValues);


            for(var i=0; i<node.parent.children.length; i++){
                if(node == node.parent.children[i]){
                    // Steal values
                    this.eventList.push(new Event("handleUnderFlowStealFromLeftNeighbor",[JSON.parse(JSON.stringify(leftNeighborNode.keys[leftNeighborNode.keys.length-1])),neighborValues,JSON.parse(JSON.stringify(node.parent.keys[i-1])),childrenValues]));
                    node.insertKey(node.parent.keys[i-1], this.order);
                    node.parent.keys[i-1] = leftNeighborNode.keys[leftNeighborNode.keys.length-1];
                    leftNeighborNode.keys.splice(leftNeighborNode.keys.length-1, 1);
                    
                    // Assign children
                    var tempNodeChildren = [];
                    tempNodeChildren.push(leftNeighborNode.children[leftNeighborNode.children.length-1]);
                    leftNeighborNode.children.splice(leftNeighborNode.children.length-1, 1);
                    for(var i=0; i<node.children.length; i++){
                        tempNodeChildren.push(node.children[i]);
                    }
                    node.children = [];
                    for(var i=0; i<tempNodeChildren.length; i++){
                        node.addChild(tempNodeChildren[i]);
                    }

                }
            }

        }
        else if(rightNeighborNode!=null && rightNeighborNode.keys.length>this.order){
            let neighborValues = [];
            let childrenValues = [];
            for(let i = 0; i < rightNeighborNode.keys.length; i++){
                neighborValues.push(rightNeighborNode.keys[i]);
            }
            this.returnAllChildrenKeys(rightNeighborNode,childrenValues);
            this.returnAllChildrenKeys(node,childrenValues);

            for(var i=0; i<node.parent.children.length; i++){
                if(node == node.parent.children[i]){
                    // Steal values
                    this.eventList.push(new Event("handleUnderFlowStealFromRightNeighbor",[JSON.parse(JSON.stringify(rightNeighborNode.keys[0])),neighborValues,JSON.parse(JSON.stringify(node.parent.keys[i])),childrenValues]));
                    node.insertKey(node.parent.keys[i], this.order);
                    node.parent.keys[i] = rightNeighborNode.keys[0];
                    rightNeighborNode.keys.splice(0, 1);

                    // Assign children
                    var tempNodeChildren = [];
                    tempNodeChildren.push(rightNeighborNode.children[0]);
                    rightNeighborNode.children.splice(0, 1);
                    for(var i=0; i<node.children.length; i++){
                        tempNodeChildren.push(node.children[i]);
                    }
                    node.children = [];
                    for(var i=0; i<tempNodeChildren.length; i++){
                        node.addChild(tempNodeChildren[i]);
                    }
                }
            }
        }

        // No NeighborNode with k+1, merge with left or right NeighborNode
        else{

            // If there is a left NeighborNode, merge with it
            if(leftNeighborNode!=null){
                let neighborChildrenValues = [];
                this.returnAllChildrenKeys(leftNeighborNode,neighborChildrenValues);

                
                for(var i=0; i<node.parent.children.length; i++){
                    if(node == node.parent.children[i]){
                        this.eventList.push(new Event("handleUnderFlowMergeWithLeftNeighbor",[JSON.parse(JSON.stringify(leftNeighborNode.keys)), JSON.parse(JSON.stringify(node.parent.keys)),JSON.parse(JSON.stringify(node.keys)), neighborChildrenValues]));
                        node.insertKey(node.parent.keys[i-1], this.order);
                        node.parent.keys.splice(i-1, 1);
                        node.parent.children.splice(i, 1);
                        for(var j=0; j<node.keys.length; j++){
                            leftNeighborNode.insertKey(node.keys[j], this.order);
                        }
    
                        // Handle children
                        for(var j=0; j<node.children.length; j++){
                            leftNeighborNode.addChild(node.children[j]);
                        }
    
    
                    }
                }
    
                // If Parent Node empty now, delete
                if(node.parent.keys.length==0 && node.parent.parent==null){
                    //this.eventList.push(new Event("parentNodeEmptyNow",[]));
                    leftNeighborNode.parent = null;
                    this.root = leftNeighborNode;
                }

            } 

            // If there is no left NeighborNode, but a right NeighborNode, merge with right NeighborNode
            else if(rightNeighborNode!=null){
                let neighborChildrenValues = [];
                this.returnAllChildrenKeys(rightNeighborNode,neighborChildrenValues);

                this.eventList.push(new Event("handleUnderFlowMergeWithRightNeighbor",[JSON.parse(JSON.stringify(rightNeighborNode.keys)), JSON.parse(JSON.stringify(node.parent.keys)), JSON.parse(JSON.stringify(node.keys)), neighborChildrenValues]));
                for(var i=0; i<node.parent.children.length; i++){
                    if(node == node.parent.children[i]){

                        node.insertKey(node.parent.keys[i], this.order);
                        node.parent.keys.splice(i, 1);
                        node.parent.children.splice(i, 1);
                        for(var j=0; j<node.keys.length; j++){
                            rightNeighborNode.insertKey(node.keys[j], this.order);
                        }

                        // Handle children
                        for(var j=0; j<node.children.length; j++){
                            rightNeighborNode.addChild(node.children[j]);
                        }

                    }
                }
                if(node.parent.keys.length==0 && node.parent.parent==null){
                    rightNeighborNode.parent = null;
                    this.root = rightNeighborNode;
                }

            }
            if(node.parent!=null){
                if(node.parent.keys.length < this.order && node.parent.parent!=null){
                    this.handleUnderflowInParent(node.parent);
                }
            }
            node = null;
        }

    }

    deleteValueInNode(value, node){
        var tempChildNode = new Node();

        // Delete value from Node
        for(var i=0; i<node.keys.length; i++){
            if(value == node.keys[i]){
                node.keys.splice(i, 1);
            }
            tempChildNode = node.children[i];
        }
        // Traverse to max value
        while(!tempChildNode.isLeaf()){
            tempChildNode = tempChildNode.children[tempChildNode.children.length-1];
        }
        // Take max value from max child and insert it in parent
        var replaceValue = tempChildNode.keys[tempChildNode.keys.length-1];
        this.eventList.push(new Event("swapWithNextLowerValue",JSON.parse(JSON.stringify(tempChildNode.keys[tempChildNode.keys.length-1]))));
        node.insertKey(replaceValue, this.order);
        this.deleteValue(replaceValue, tempChildNode);
    }
	
    findValue(value, nodeToCheck){
        var node = this.findNode(value, nodeToCheck);
        if(node==null){
            return null;
        }else{
            for(var i=0; i<node.keys.length; i++){
                if(value == node.keys[i]){
                    return node.keys[i];
                }
            }
        }
    }

    findNode(value, nodeToCheck){
        for(var i=0; i<nodeToCheck.keys.length; i++){
            if(value == nodeToCheck.keys[i]){
                return nodeToCheck;
            }
        }
        if(nodeToCheck.isLeaf()){
            return null;
        }
        for(var i=0; i<nodeToCheck.keys.length; i++){
            if(value < nodeToCheck.keys[i]){
                return this.findNode(value, nodeToCheck.children[i]);
            } else if(nodeToCheck.keys[i] < value && nodeToCheck.keys[i+1]==null){
                return this.findNode(value, nodeToCheck.children[i+1]);
            }
        }
    }
	
    insertKey(newKey){
        newlyInsertedKey = newKey;
        var leafNode = this.getLeafNode(newKey, this.root);

        // If leafNode is not full, insert
        if(!leafNode.isFull(this.order)){
            this.eventList.push(new Event("insertLeafNotFull",newKey));
            leafNode.insertKey(newKey, this.order);
        }
        // If leafNode is full, split
        else{ 
            // Insert 2k+1 values in node
            this.eventList.push(new Event("checkedLeafFull", JSON.parse(JSON.stringify(leafNode.keys))));
            for(var i=0; i<=this.order*2; i++){
                if(newKey < leafNode.keys[i] || leafNode.keys[i]==null){
                    leafNode.keys.splice(i, 0, newKey);
                    this.eventList.push(new Event("createIllegalNodeState", JSON.parse(JSON.stringify(leafNode.keys))));
                    break;
                }
            }
            // Split Node with 2k+1 values
            this.split(leafNode, this.order);
        }
    }
    getLeafNode(newKey, nodeToCheck){
        if(nodeToCheck.isLeaf()){
            return nodeToCheck;
        } else{
            for(var i=0; i<nodeToCheck.keys.length; i++){
                if(newKey < nodeToCheck.keys[i]){
                    return this.getLeafNode(newKey, nodeToCheck.children[i]);
                } else if(nodeToCheck.keys[i] < newKey && nodeToCheck.keys[i+1]==null){
                    return this.getLeafNode(newKey, nodeToCheck.children[i+1]);
                }
            }
        }
    }
    split(nodeToSplit, order){
        this.eventList.push(new Event("gonnaSplit", JSON.parse(JSON.stringify(nodeToSplit.keys))));
        var parentNode = new Node();
        if(nodeToSplit.parent!=null) parentNode = nodeToSplit.parent;
        var neighborNode = new Node();

        // Insert values in new neighbor Node
        var insertInParent = nodeToSplit.keys[order];

        for(var i=order+1; i<=order*2; i++){
            neighborNode.keys.push(nodeToSplit.keys[i]);
            if(nodeToSplit.children.length!=0){
                nodeToSplit.children[i].parent = neighborNode;
                neighborNode.children.push(nodeToSplit.children[i]);
                if(nodeToSplit.keys[i+1]==null){
                    nodeToSplit.children[i+1].parent = neighborNode;
                    neighborNode.children.push(nodeToSplit.children[i+1]);
                }
            }
        }
        // Delete values from nodeToSplit, which were inserted into new neighbor Node
        while(nodeToSplit.keys[order]!=null){
            nodeToSplit.keys.splice(order, 1);
            if(nodeToSplit.children.length!=0){
                nodeToSplit.children.splice(order+1, 1);
            }
        }
        if(!parentNode.isFull(this.order)){

            parentNode.insertKey(insertInParent, this.order);
            this.eventList.push(new Event("parentNodeNotFullWhileSplitting", JSON.parse(JSON.stringify(parentNode.keys))));
            // Add children to parent Node
            if(nodeToSplit.parent==null){
                parentNode.addChild(nodeToSplit);
            }
            parentNode.addChild(neighborNode);
            // If parent has no parent, set parent as new root
            if(parentNode.parent==null) this.root = parentNode;
        } else{
            this.eventList.push(new Event("parentNodeFullWhileSplitting", JSON.parse(JSON.stringify(parentNode.keys))));

            for(var i=0; i<=this.order*2; i++){
                if(insertInParent < parentNode.keys[i] || parentNode.keys[i]==null){
                    parentNode.keys.splice(i, 0, insertInParent);
                    this.eventList.push(new Event("createIllegalNodeState", JSON.parse(JSON.stringify(parentNode.keys))));
                    break;
                }
            }
            if(nodeToSplit.parent==null){
                parentNode.addChild(nodeToSplit);
            }
            parentNode.addChild(neighborNode);

            this.split(parentNode, this.order);
        }
        
    }

    getDepth(){
        var currentNode = this.root;
        var depth = 1;
        while(currentNode.children[0]!=null){
            depth += 1;
            currentNode = currentNode.children[0];
        }
        return depth;
    }

    returnTreeObject(){
        var currentNode = this.root;
        var depth = this.getDepth();
        var depthCounter = 0;
        var stringsLevel = [];
        // Insert empty strings into array, so there is no "undefined" in front of each entry
        for(var i=0; i<depth; i++){
            var array = [];
            stringsLevel.push(array);
        }
        // Recursive printNode-function fills stringsLevel-Array
        this.printNodeObject(currentNode, stringsLevel, depthCounter);
        return stringsLevel;
    }
    printNodeObject(node, stringsLevel, depth){
        if(node.keys.length > 0){
            stringsLevel[depth].push(node);
        }
        stringsLevel.events = this.eventList;
        if(!node.isLeaf()){
            depth += 1;
            for(var i=0; i<node.children.length; i++){
                this.printNodeObject(node.children[i], stringsLevel, depth);
            }
        }
    }
}

class Node{
    constructor(){
        this.parent = null;
        this.keys = [];
        this.children = [];
    }
    insertKey(newKey, order){
        if(!this.isFull(order)){
            for(var i=0; i<=order*2-1; i++){
                if(newKey < this.keys[i] || this.keys[i]==null){
                    this.keys.splice(i, 0, newKey);
                    break;
                }
            }
        }
    }
    isLeaf(){
        if(this.children.length == 0){
            return true;
        }else{
            return false;
        }
    }
    isFull(order){
        for(var i=0; i<=order*2-1; i++){
            if(this.keys[i]==null){
                return false;
            }
        }
        return true;
    }
    addChild(newChildNode){
        newChildNode.parent = this;
        var key1 = newChildNode.keys[0];
        for(var i=0; i<this.keys.length; i++){
            if(key1 < this.keys[i]){
                this.children.splice(i, 0, newChildNode);
                break;
            } else if(this.keys[i] < key1 && this.keys[i+1]==null){
                this.children.splice(i+1, 0, newChildNode);
                break;
            }
        }
    }
}
