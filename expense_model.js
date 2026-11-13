//To store all the expenses while the server is running.
let expenses = [];
let previousExpenses = undefined;

//To add a new expense in the list.
async function createExpense(amount, category, date, description){

    const expense = {amount, category, date, description};
    expenses.push(expense);

    return expense;
};

async function getExpenses(){

    return expenses;
};

//To delete an expense.
async function deleteExpense(index){

    //So that it only deletes one expense from the list.
    const expense = expenses[index];
    let newExpenses = [];

    //A for loop to make sure to keep the rest of the other expenses from the list.
    for(let i = 0; i < expenses.length; i++){
        if(i !== index){
            newExpenses.push(expenses[i]);
        }
    }

    //To save the old list just incase the user wants to undo it later.
    previousExpenses = expenses
    expenses = newExpenses

    return expense;
};

//So that the previous list is not lost and the user can get it back.
async function undoDelete(){

    const restored = previousExpenses;

    //An if statement for restored where if soemthing is delete than we store it back.
    if(restored){

        expenses = restored;
        //Set previousExpenses back to undefined so that can only be undo once.
        previousExpenses = undefined;
    }

    return restored;
}

export {createExpense, getExpenses, deleteExpense, undoDelete};