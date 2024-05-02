 
    let cart = [];  

    function openModal(productData) {
        updateModal(productData);
        document.getElementById("myModal").style.display = 'flex';
    }
        
    const plusBtn = document.querySelector(".fa-plus");
    const minusBtn = document.querySelector(".fa-minus");

    function showHtml() {
        document.querySelector('.numberQ').innerHTML = quantityOfItem;
    }
    
    let quantityOfItem = 1;
     
        plusBtn.addEventListener("click", () => {

            if (quantityOfItem >= 5) {
                quantityOfItem = 5
            }
            else {
                quantityOfItem++;
            }
            showHtml();
        });
    
        minusBtn.addEventListener("click", () => {
            if (quantityOfItem <= 0) {
                quantityOfItem = 0;
            }
            quantityOfItem--;
                showHtml();
        });

    function addToCart(productData) {

    //   console.log(quantityOfItem)
    const quantityOfItems = quantityOfItem;
    console.log(quantityOfItems)

        fetch('/add-to-cart', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                productId: parseInt(productData.id),
                productName:String(productData.title),
                productPrice:Number(productData.price),
                productImage:productData.image,
                productRating:productData.rating,
                productCategory:productData.category,
                quantityOfItem:Number(quantityOfItems)
            })
        }).then(response => {
            if (response.ok) {
                console.log("prodcut with product ID is added",productId)
                
            } else {
                response.text()
                .then(errorMessage => {
                    console.error(`Failed to add product to cart: ${errorMessage}`);
                });
            }
        }).catch(error => {
            console.error('Error adding product to cart:', error);
        });

        saveToStorage();
    }

    function saveToStorage() {
        localStorage.setItem('cart', JSON.stringify(cart));
    }
    


    function updateModal(productData) {
        const titleProductName = document.getElementById("title-product-id");
        titleProductName.innerHTML = productData.title;

        const titleProductImage = document.querySelector(".img-product");
        titleProductImage.innerHTML = `<img src="${productData.image}">`;

        const productPrice = document.querySelector(".price");
        productPrice.innerHTML = "Rs. " + productData.price + " /-";

        const description = document.querySelector(".discription");
        description.innerHTML = productData.description;

        const rating = document.querySelector('.rating');
        rating.innerHTML = `<img src="imges/ratings/rating-${productData.rating.rate * 10}.png">`;

        const rateCount = document.querySelector('.rateCount');
        rateCount.innerHTML = productData.rating.count + " persons";

        const addToCartButton = document.querySelector('.modelAddToCart');
        addToCartButton.addEventListener('click', () => addToCart(productData));
    }


    function renderProducts(array) {

        array.forEach(productData => {
            const productElement = document.createElement("div");
            productElement.classList.add("product");

            productElement.innerHTML = `
            
                <img src="${productData.image}">
                <div class="description">
                    <span>${productData.title}.</span>
                    <div id="priceData">₹ ${productData.price} /-</div>
                </div>
                <div class="btn-div">
                    <button type="button" class="btn btn-dark openModalLink">View Details</button>
                </div>
        
        
            `;

            document.getElementById("productList").appendChild(productElement);

            const openModalLink = productElement.querySelector('.openModalLink');

            openModalLink.addEventListener("click", () => {
                openModal(productData)
            });
        });
    }

    fetch('/products')
        .then(response => response.json())
        .then(products => {
            let productsArry = [];
            for (let i = 0; i < products.length; i++) {
                productsArry.push(products[i]);
            }
            // Function to shuffle an array using {Fisher-Yates algorithm} =========>>> chatGPT
            function shuffleArray(productsArry) {
                for (let i = productsArry.length - 1; i > 0; i--) {
                    const j = Math.floor(Math.random() * (i + 1));
                    [productsArry[i], productsArry[j]] = [productsArry[j], productsArry[i]];
                }
            }

            function shuffleAndSortAscending(array) {
                array.sort((a, b) => a.price - b.price);
                document.getElementById("productList").innerHTML = '';
                renderProducts(array);
            }

            function shuffleAndSortDescending(array) {
                array.sort((a, b) => b.price - a.price);
                document.getElementById("productList").innerHTML = '';
                renderProducts(array);
            }
            
            shuffleArray(productsArry)
            var radioButtons = document.querySelectorAll('.radioC');

            radioButtons.forEach((radio) => {
                radio.addEventListener('change', function () {
                    let selectedValue = document.querySelector('input[name="sort"]:checked').value;
                    if (selectedValue == 'low to high') {
                        shuffleAndSortAscending(productsArry);
                    }
                    if (selectedValue == 'high to low') {
                        shuffleAndSortDescending(productsArry);
                    }
                });
            });
            
            renderProducts(productsArry);

        })
        .catch(error => console.error('Error fetching products:', error));

     