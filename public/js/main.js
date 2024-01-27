// function closeModal() {
// document.getElementById("myModal").style.display = 'none';
// }
 
document.addEventListener("DOMContentLoaded", function () {

     
    
   
fetch('/products')
    .then(response => response.json())
    .then(products => {

        let productsArry = [];
        for (let i = 0; i < products.length; i++) {
            productsArry.push(products[i]);
        }
        console.log(productsArry);
 
        function shuffleAndSortAscending(array) {
     
            array.sort((a, b) => a.price - b.price);

            document.getElementById("productList").innerHTML = '';

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
                        <button type="button" class="btn btn-dark  openModalLink">Add to Cart</button>
                    </div>
                `;

                document.getElementById("productList").appendChild(productElement);

                const addToCart = productElement.querySelector('.openModalLink');

                addToCart.addEventListener("click", () => {
 


                    const titleProductName = document.getElementById("title-product-id");
                    titleProductName.innerHTML = productData.title;

                    const titleProductImage = document.querySelector(".img-product");
                    titleProductImage.innerHTML = `<img src="${productData.image}">`;

                    const productPrice = document.querySelector(".price");
                    productPrice.innerHTML = "Rs. " + productData.price + " /-";

                    const description = document.querySelector(".discription");
                    description.innerHTML = productData.description

                    const rating = document.querySelector('.rating')
                    rating.innerHTML = `<img src="imges/ratings/rating-${productData.rating.rate * 10}.png">`

                    const rateCount = document.querySelector('.rateCount')
                    rateCount.innerHTML = productData.rating.count + " persons";

                });

            });
            const openModalLinks = document.querySelectorAll(".openModalLink");
            openModalLinks.forEach(link => {
                link.addEventListener("click", openModal);
            });
    


        }
 

        function shuffleAndSortDescending(array) {
           
            array.sort((a, b) => b.price - a.price);

            document.getElementById("productList").innerHTML = '';

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
                        <button type="button" class="btn btn-dark addToCartBtn openModalLink">Add to Cart</button>
                    </div>
                `;

                document.getElementById("productList").appendChild(productElement);

                const addToCart = productElement.querySelector('.addToCartBtn');

                addToCart.addEventListener("click", () => {
                    console.log("Product added")

                    const titleProductName = document.getElementById("title-product-id");
                    titleProductName.innerHTML = productData.title;

                    const titleProductImage = document.querySelector(".img-product");
                    titleProductImage.innerHTML = `<img src="${productData.image}">`;

                    const productPrice = document.querySelector(".price");
                    productPrice.innerHTML = "Rs. " + productData.price + " /-";

                    const description = document.querySelector(".discription");
                    description.innerHTML = productData.description

                    const rating = document.querySelector('.rating')
                    rating.innerHTML = `<img src="imges/ratings/rating-${productData.rating.rate * 10}.png">`

                    const rateCount = document.querySelector('.rateCount')
                    rateCount.innerHTML = productData.rating.count + " persons";
                });

            });
            const openModalLinks = document.querySelectorAll(".openModalLink");
            openModalLinks.forEach(link => {
                link.addEventListener("click", openModal);
            });
    
        }
     
        
        var radioButtons = document.querySelectorAll('.radioC');
        
        radioButtons.forEach( (radio) => {
            radio.addEventListener('change', function () {
     
                let  selectedValue = document.querySelector('input[name="sort"]:checked').value;


                console.log(selectedValue)

                if (selectedValue == 'low to high') {
                    shuffleAndSortAscending(productsArry); //ascending aarry
                }
    
                if (selectedValue == 'high to low') {
                    shuffleAndSortDescending(productsArry) // descending array
                }

            });

        });
 
        productsArry.forEach(productData => {

            const productElement = document.createElement("div");
            productElement.classList.add("product");

            productElement.innerHTML = `
                <img src="${productData.image}">
                <div class="description">
                    <span>${productData.title}.</span>
                    <div id="priceData">₹ ${productData.price} /-</div>
                </div>
                <div class="btn-div">
                    <button type="button" class="btn btn-dark   openModalLink">Add to Cart</button>
                </div>
            `;

            document.getElementById("productList").appendChild(productElement);

            const addToCart = productElement.querySelector('.openModalLink');
 

            addToCart.addEventListener("click", () => {

                const titleProductName = document.getElementById("title-product-id");
                titleProductName.innerHTML = productData.title;

                const titleProductImage = document.querySelector(".img-product");
                titleProductImage.innerHTML = `<img src="${productData.image}">`;

                const productPrice = document.querySelector(".price");
                productPrice.innerHTML = "Rs. " + productData.price + " /-";

                const description = document.querySelector(".discription");
                description.innerHTML = productData.description

                const rating = document.querySelector('.rating')
                rating.innerHTML = `<img src="imges/ratings/rating-${productData.rating.rate * 10}.png">`

                const rateCount = document.querySelector('.rateCount')
                rateCount.innerHTML = productData.rating.count + " persons";
            });

        });

        const openModalLinks = document.querySelectorAll(".openModalLink");
        openModalLinks.forEach(link => {
            link.addEventListener("click", openModal);
        });

    })
    .catch(error => console.error('Error fetching products:', error));
    
});
 
function openModal() {
document.getElementById("myModal").style.display = 'flex';
}

