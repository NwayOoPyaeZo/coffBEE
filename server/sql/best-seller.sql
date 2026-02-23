SELECT
  p.name,
  COALESCE(SUM(oi.quantity), 0) AS total_sold
FROM products p
JOIN order_items oi ON oi.product_id = p.id
JOIN orders o ON o.id = oi.order_id
WHERE o.status = 'completed'
GROUP BY p.name
ORDER BY total_sold DESC
LIMIT 1;
