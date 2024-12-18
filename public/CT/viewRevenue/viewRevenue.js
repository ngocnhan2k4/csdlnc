const app = new Vue({
    el: "#app", // Gắn vào phần tử có id "app"
    data: {
        branch : [], // Danh sách chi nhánh
        selectedBranch: null, // Chi nhánh được chọn
        revenueTypes: ["year", "month", "day"], // Các loại báo cáo
        selectedType: null, // Loại báo cáo được chọn
    },
    methods: {
        async fetchBranchs() {
            try {
                const response = await axios.get("/company/branch"); // Gọi API lấy danh sách chi nhánh
                this.branch = response.data; // Gán dữ liệu trả về vào branch
            } catch (error) {
                console.error("Lỗi khi gọi API:", error);
            }
        },
        async fetchRevenueByType() {
            if (this.selectedType) {
                // Chuyển hướng đến URL với type được chọn
                window.location.href = `/company/revenue/${this.selectedType}`;
            } else {
                alert("Vui lòng chọn loại báo cáo!");
            }
        },
    },
    mounted() {
        // Giả lập dữ liệu branch
        this.fetchBranchs();
    },
});
