UPDATE `routes`
SET `route_name` = LEFT(CONCAT(`start_name`, ' - ', `end_name`), 100)
WHERE `route_name` REGEXP '^Route [0-9]+$'
  AND COALESCE(TRIM(`start_name`), '') <> ''
  AND COALESCE(TRIM(`end_name`), '') <> '';

UPDATE `route_stops` AS current_stop
SET `position` = 1 + (
  SELECT COUNT(*)
  FROM (
    SELECT `id`, `route_id`
    FROM `route_stops`
  ) AS earlier_stops
  WHERE earlier_stops.`route_id` = current_stop.`route_id`
    AND earlier_stops.`id` < current_stop.`id`
);
