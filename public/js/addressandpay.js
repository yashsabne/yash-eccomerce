function openModalAdd() {
  document.getElementById("myModalAddress").style.display = 'flex';
}

function closeModalAdd() {
  document.getElementById("myModalAddress").style.display = 'none';
}

// Get the element with the class 'openModalAddressLink'
const openModalLink = document.querySelector('.openModalAddressLink');
const openModelLinkBigOne = document.querySelector('.openModelLinkBigOne')

// Add an event listener to the element
openModalLink.addEventListener("click", () => {
 openModalAdd()
});


//  const deleteButtonAddress = document.getElementById("deleteAddress")

async function removeAddress(index) {
try {
  const addressContainer = document.querySelector(`.js-address-container-${index}`);
  console.log(addressContainer)
  if (addressContainer) {
    addressContainer.remove();
  }

  const response = await fetch('/delete-add', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ index })
  });

  if (response.ok) {
    console.log(`Address with index ${index} deleted successfully`);
  } else {
    throw new Error('Failed to delete address');
  }
} catch (error) {
  console.error('Error deleting address:', error);
}
}

const deleteBtns = document.querySelectorAll('.deleteAddress');
deleteBtns.forEach((btn, index) => {
btn.addEventListener('click', async () => {
  await removeAddress(index);
});
});

// Define the function for making the fetch call
const textSpace = document.getElementById('savedtheaddressnotify')
const SaveAddressButton = document.querySelector('.BtnAddressAdd');
const formInputs = document.querySelectorAll('input[type="text"], input[type="email"], textarea, select');
const modelBoxAlert = document.querySelector('.div-container-modelBox-alert')


SaveAddressButton.addEventListener("click", (event) => {
let allInputsFilled = true; 

formInputs.forEach(input => {
  if (input.value.trim() === '' && input.required) {
    allInputsFilled = false;
  }
});

if (!allInputsFilled) {
  event.preventDefault(); // Prevent form submission
  modelBoxAlert.innerHTML = `<!-- model for address -->
  <div class="modal fade" id="exampleModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog" role="document">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="exampleModalLabel">Got Alert</h5>
          <button type="button" class="close" data-dismiss="modal" aria-label="Close">
            <span aria-hidden="true">&times;</span>
          </button>
        </div>
        <div class="modal-body" style="color:red">
          Please Add All the fields
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
        </div>
      </div>
    </div>
  </div>`
}
});

const addressRadioButtons = document.querySelectorAll('input[name="selectAddress"]');
let selectedAddressIndex = -1;

addressRadioButtons.forEach((radioButton, index) => {
  radioButton.addEventListener('click', () => {
    selectedAddressIndex = index;
    console.log(`Selected address index: ${selectedAddressIndex}`);
    
  });
});

const paymentOptionsSelection = document.querySelectorAll('input[name="paymentOption"]');
let selectedPaymentMethod = '';
 
paymentOptionsSelection.forEach((radioButton) => {
  radioButton.addEventListener('change', () => {
    if (radioButton.checked) {
      selectedPaymentMethod = radioButton.id;
      console.log(`Selected payment method: ${selectedPaymentMethod}`);
      if (selectedPaymentMethod === 'otherMethod') {
        handleOtherPaymentMethod();
      }
      else {

       async function cashOnDelivery() {

        try {    
        const response = await fetch('/getTotalPiceWithDescription');
        const data = await response.json();
        const totalPrice = data.totalAfterTax;
        const userName = data.userName;
        const emailAdd = data.emailAdd;    
    
          const confirmOrder = async () => {
            try {
              const response = await fetch('/orderConfirm', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ selectedAddressIndex, selectedPaymentMethod,totalPrice })
              });
      
              if (!response.ok) {
                throw new Error('Network response was not ok');
              }
              
              window.location.href = '/orderSucess';
            } catch (error) {
              console.error('Error confirming order:', error);
            }
          };
          document.getElementById('orderConfirmButton').onclick = function () {
           confirmOrder();
          };

        } catch (error) {
          console.error('There was a problem with your fetch operation:', error);
        }
        }
        cashOnDelivery();
      }
    }
  });
});

async function handleOtherPaymentMethod() {
  try {
    const response = await fetch('/getTotalPiceWithDescription');
    const data = await response.json();
    const totalPrice = data.totalAfterTax;
    const userName = data.userName;
    const emailAdd = data.emailAdd;

    const confirmOrder = async () => {
      try {
        const paymentDone = true
     
        const response = await fetch('/orderConfirm', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ selectedAddressIndex, selectedPaymentMethod,paymentDone,totalPrice })
        });

        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        
        window.location.href = '/orderSucess';
      } catch (error) {
        console.error('Error confirming order:', error);
      }
    };

    const options = {
      key: 'rzp_test_SLeOOqQEvpGxpv',
      amount: totalPrice * 100,
      currency: 'INR',
      name: 'Yash Store',
      image: 'https://img.freepik.com/free-psd/silver-letters-glass-building-facade_145275-162.jpg',
      handler:async function (response) {
        if (response.error) {
          console.error('Payment error:', response.error);
          // Handle payment failure
        } else {
         await confirmOrder();
        }
      },
      prefill: {
        name: userName,
        email: emailAdd,
        contact: '7276462261'
      },
      theme: {
        color: '#00539C'
      }
    };
    document.getElementById('orderConfirmButton').onclick = function () {
      let rzp = new Razorpay(options);
      rzp.open();
    };
  } catch (error) {
    console.error('Error fetching data:', error);
  }c
}



openModelLinkBigOne.addEventListener("click",() => {
  openModalAdd();
  })