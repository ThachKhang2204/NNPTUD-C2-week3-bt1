// Hàm getAll để lấy tất cả sản phẩm từ API
async function getAll() {
    try {
        // Hiển thị loading
        const loading = document.getElementById('loading');
        loading.style.display = 'block';
        
        // Gọi API
        const response = await fetch('https://api.escuelajs.co/api/v1/products');
        
        // Kiểm tra response
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        // Chuyển đổi dữ liệu thành JSON
        const products = await response.json();
        
        // Ẩn loading
        loading.style.display = 'none';
        
        // Lưu dữ liệu
        allProducts = products;
        
        // Hiển thị trang đầu tiên
        goToPage(1);
        
        return products;
    } catch (error) {
        console.error('Lỗi khi lấy dữ liệu:', error);
        const loading = document.getElementById('loading');
        loading.textContent = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại!';
        loading.style.color = 'red';
    }
}

// Biến lưu trữ dữ liệu và phân trang
let allProducts = [];
let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { field: null, order: 'asc' };

// Hàm hiển thị sản phẩm lên bảng
function displayProducts(products) {
    const tableBody = document.getElementById('productTableBody');
    tableBody.innerHTML = ''; // Xóa nội dung cũ
    
    products.forEach(product => {
        const row = document.createElement('tr');
        
        // Lấy hình ảnh đầu tiên từ mảng images và làm sạch URL
        let imageUrl = 'https://via.placeholder.com/100?text=No+Image';
        if (product.images && product.images.length > 0) {
            // Loại bỏ dấu ngoặc vuông và khoảng trắng thừa
            imageUrl = product.images[0].replace(/[\[\]"]/g, '').trim();
        }

        row.innerHTML = `
            <td><span class="product-id">#${product.id}</span></td>
            <td>
                <div class="image-wrapper">
                    <img src="${imageUrl}" 
                         alt="${product.title}" 
                         class="product-image" 
                         referrerpolicy="no-referrer" 
                         onerror="this.src='https://via.placeholder.com/100?text=No+Image'" />
                </div>
            </td>
            <td class="product-name">
                ${product.title}
                <span class="info-icon" title="Hover để xem mô tả">ℹ️</span>
            </td>
            <td class="product-price">$${product.price}</td>
            <td class="product-description-cell">
                <div class="product-description-tooltip">${product.description || 'Không có mô tả'}</div>
            </td>
            <td><span class="product-category">${product.category?.name || 'N/A'}</span></td>
        `;
        
        tableBody.appendChild(row);
    });
}

// Hàm sắp xếp sản phẩm
function sortProducts(field, order) {
    allProducts.sort((a, b) => {
        let valueA, valueB;
        
        if (field === 'price') {
            valueA = a.price;
            valueB = b.price;
        } else if (field === 'name') {
            valueA = a.title.toLowerCase();
            valueB = b.title.toLowerCase();
        }
        
        if (order === 'asc') {
            return valueA > valueB ? 1 : valueA < valueB ? -1 : 0;
        } else {
            return valueA < valueB ? 1 : valueA > valueB ? -1 : 0;
        }
    });
}

// Hàm cập nhật icon sắp xếp
function updateSortIcons() {
    // Reset tất cả icons
    document.querySelectorAll('.sortable').forEach(th => {
        th.classList.remove('sort-asc', 'sort-desc');
    });
    
    // Thêm class cho cột đang được sắp xếp
    if (currentSort.field) {
        const sortHeader = document.querySelector(`[data-sort="${currentSort.field}"]`);
        if (sortHeader) {
            sortHeader.classList.add(`sort-${currentSort.order}`);
        }
    }
}

// Hàm tính toán phân trang
function paginate(products, page, perPage) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return products.slice(start, end);
}

// Hàm cập nhật thông tin trang
function updatePageInfo() {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    document.getElementById('pageInfo').textContent = `Trang ${currentPage} / ${totalPages}`;
}

// Hàm tạo nút phân trang
function createPagination() {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    const pageNumbersDiv = document.getElementById('pageNumbers');
    pageNumbersDiv.innerHTML = '';
    
    // Tạo các nút số trang
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    for (let i = startPage; i <= endPage; i++) {
        const pageBtn = document.createElement('button');
        pageBtn.textContent = i;
        pageBtn.className = 'page-btn' + (i === currentPage ? ' active' : '');
        pageBtn.onclick = () => goToPage(i);
        pageNumbersDiv.appendChild(pageBtn);
    }
    
    // Cập nhật trạng thái nút điều hướng
    document.getElementById('firstPage').disabled = currentPage === 1;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;
    document.getElementById('lastPage').disabled = currentPage === totalPages;
}

// Hàm chuyển trang
function goToPage(page) {
    const totalPages = Math.ceil(allProducts.length / itemsPerPage);
    if (page < 1 || page > totalPages) return;
    
    currentPage = page;
    
    // Áp dụng sắp xếp nếu có
    if (currentSort.field) {
        sortProducts(currentSort.field, currentSort.order);
    }
    
    const paginatedProducts = paginate(allProducts, currentPage, itemsPerPage);
    displayProducts(paginatedProducts);
    updatePageInfo();
    createPagination();
    updateSortIcons();
    
    // Scroll về đầu bảng
    document.querySelector('.table-container').scrollIntoView({ behavior: 'smooth' });
}

// Gọi hàm getAll khi trang web được tải
document.addEventListener('DOMContentLoaded', () => {
    getAll();
    
    // Xử lý thay đổi số sản phẩm mỗi trang
    document.getElementById('itemsPerPage').addEventListener('change', (e) => {
        itemsPerPage = parseInt(e.target.value);
        currentPage = 1;
        goToPage(1);
    });
    
    // Xử lý các nút điều hướng
    document.getElementById('firstPage').addEventListener('click', () => goToPage(1));
    document.getElementById('prevPage').addEventListener('click', () => goToPage(currentPage - 1));
    document.getElementById('nextPage').addEventListener('click', () => goToPage(currentPage + 1));
    document.getElementById('lastPage').addEventListener('click', () => {
        const totalPages = Math.ceil(allProducts.length / itemsPerPage);
        goToPage(totalPages);
    });
    
    // Xử lý sắp xếp
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            const field = header.dataset.sort;
            
            // Toggle order nếu click vào cùng một cột
            if (currentSort.field === field) {
                currentSort.order = currentSort.order === 'asc' ? 'desc' : 'asc';
            } else {
                currentSort.field = field;
                currentSort.order = 'asc';
            }
            
            // Sắp xếp và quay về trang 1
            currentPage = 1;
            goToPage(1);
        });
    });
});
