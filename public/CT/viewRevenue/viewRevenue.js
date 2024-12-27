const app = new Vue({
    el: "#app", // Gắn vào phần tử có id "app"
    data: {
        type: "day", // Loại báo cáo
        branch: 0, // Chi nhánh
    },
    methods: {
        
        async fetchRevenueByType() {
            if (this.type) {
                // Chuyển hướng đến URL với type được chọn
                window.location.href = `/company/revenue/${this.type}?branch=${this.branch}`;
            } else {
                alert("Vui lòng chọn loại báo cáo!");
            }
        },
    },
});
