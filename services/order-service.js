import { Order } from "../db/models/order";
import { OrderItem } from "../db/models/orderItem";
//import { User } from "../db/models/User";

class OrderService {
  // 사용자
  static async addOrder(data) {
    const order = await Order.create(data);

    if (!order) {
      return { errorMessage: "주문을 생성하는 동안 오류가 발생했습니다." };
    }

    return order;
  }

  // role 조건문 빼고 매개변수 수정
  static async getOrder(query, page) {
    //data : user or admin
    const perPage = 10;

    const [orders, totalPage] = await Order.getPaginatedOrders(
      query,
      page,
      perPage
    );

    if (!orders) {
      return { errorMessage: "주문을 불러오는데 오류가 발생했습니다." };
    }

    return { totalPage, orders };
  }

  static async setOrder(order_id, updateData, role) {
    const order = await Order.findByOrderId(order_id);

    if (!order) {
      return { errorMessage: "주문 내역이 없습니다." };
    }
    //console.log(order.order_status);

    if (role === "user") {
      if (
        order.order_status === "SHIPPED" ||
        order.order_status === "DELIVERED"
      ) {
        return { errorMessage: "배송이 시작되어 수정이 불가능합니다." };
      } else if (
        order.order_status === "ORDER_CONFIRMED" ||
        order.order_status === "PREPARING_FOR_SHIPMENT"
      ) {
        return await Order.update(order_id, updateData);
      }
    } else if (role === "admin") {
      return await Order.update(order_id, updateData);
    }
    // user 수정가능 주소/전화번호/이름/요청사항
    // admin 수정가능 주문상태
    // enum 적용이 안됨 order_status 오타나도 그대로 적용됨 수정필요
  }

  static async deleteOrder({ orderId, role }) {
    const order = await Order.findByOrderId(orderId);

    if (!order) {
      return { errorMessage: "주문 내역이 없습니다." };
    }

    if (
      order.order_status === "SHIPPED" ||
      order.order_status === "DELIVERED"
    ) {
      return { errorMessage: "배송이 시작되어 취소가 불가능합니다." };
    } else if (
      order.order_status === "ORDER_CONFIRMED" ||
      order.order_status === "PREPARING_FOR_SHIPMENT"
    ) {
      await Order.delete(orderId);

      return role === "admin"
        ? { message: "관리자 권한으로 취소되었습니다." }
        : { message: "사용자가 주문을 취소하였습니다." };
    }
  }
}

export default OrderService;
