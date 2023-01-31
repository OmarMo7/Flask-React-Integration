import cv2
import numpy as np
import os
import time
import pytesseract
from flask import make_response, abort
from base64 import b64decode
from config import db
from model import Person, people_schema, person_schema
import convert_numbers


def remove_white_background(img):
    img[np.where((img == [255, 255, 255]).all(axis=2))] = [0, 0, 0]
    return img


def getAveragePixQuarter(image):
    quarter_top_left = image[:len(image)//2, :len(image[0])//2]
    quarter_bottom_left = image[len(image)//2:, :len(image[0])//2]
    quarter_top_right = image[:len(image)//2, len(image[0])//2:]
    quarter_bottom_right = image[len(image)//2:, len(image[0])//2:]
    quarters = {'quarter_top_left': np.average(quarter_top_left), 'quarter_bottom_left': np.average(quarter_bottom_left),
                'quarter_top_right': np.average(quarter_top_right), 'quarter_bottom_right': np.average(quarter_bottom_right)}
    sorted_quarters_by_avg = sorted(quarters.items(), key=lambda x: x[1])
    if sorted_quarters_by_avg[-1][0] != "quarter_top_left":
        if sorted_quarters_by_avg[-1][0] == "quarter_bottom_left":
            image = perform_rotation(image, 1)
        elif sorted_quarters_by_avg[-1][0] == "quarter_bottom_right":
            image = perform_rotation(image, 2)
        elif sorted_quarters_by_avg[-1][0] == "quarter_top_right":
            image = perform_rotation(image, 3)
    image_adjusted = cv2.resize(image, (1280, 820))
    return image_adjusted


def perform_rotation(img, num_rotations):
    if num_rotations == 1:
        image_rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
    elif num_rotations == 2:
        image_rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        image_rotated = cv2.rotate(image_rotated, cv2.ROTATE_90_CLOCKWISE)
    elif num_rotations == 3:
        image_rotated = cv2.rotate(img, cv2.ROTATE_90_CLOCKWISE)
        image_rotated = cv2.rotate(image_rotated, cv2.ROTATE_90_CLOCKWISE)
        image_rotated = cv2.rotate(image_rotated, cv2.ROTATE_90_CLOCKWISE)
    return image_rotated


def perspectiveTransform(image, border_points):
    a, b, c, d = border_points
    origin_points_dict = {'a': [0, 0], 'b': [
        0, 820], 'c': [1280, 0], 'd': [1280, 820]}
    border_points_dict = {'a': a, 'b': b, 'c': c, 'd': d}
    # print(border_points)
    origin_points = dict(sorted(origin_points_dict.items(),
                         key=lambda item: item[1][0] + item[1][1]))
    border_points = dict(sorted(border_points_dict.items(),
                         key=lambda item: item[1][0] + item[1][1]))
    origin_points = list(origin_points.values())
    border_points = list(border_points.values())
    if border_points[1][0] > border_points[1][1] and origin_points[1][0] < origin_points[1][1]:
        temp = [border_points[1][0], border_points[1][1]]
        border_points[1] = border_points[2]
        border_points[2] = temp
    # print("_______________")
    # print(origin_points)
    # print(border_points)
    pts1 = np.float32(border_points)
    pts2 = np.float32(origin_points)
    M = cv2.getPerspectiveTransform(pts1, pts2)
    transformed = cv2.warpPerspective(image, M, (1280, 820))
    # cv2.imshow("transformed",transformed)
    cv2.imwrite('transformed_image.jpg', transformed)
    cv2.waitKey(0)


def draw_contours(image, biggest_contour):
    border_points = []
    peri = cv2.arcLength(biggest_contour, True)
    approx = cv2.approxPolyDP(biggest_contour, 0.015*peri, True)
    if len(approx) == 4:
        screenCnt = approx
        n = approx.ravel()
        i = 0
        for j in n:
            if (i % 2 == 0):
                x = n[i]
                y = n[i + 1]
                border_points.append([x, y])
            i = i + 1

    cv2.drawContours(image, [screenCnt], -1, (0, 255, 0), 3)
    return border_points


def crop_image(image):
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    thresh = cv2.threshold(gray, 0, 255, cv2.THRESH_BINARY+cv2.THRESH_OTSU)[1]
    cnts = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnts = cnts[0] if len(cnts) == 2 else cnts[1]
    cnts = sorted(cnts, key=cv2.contourArea, reverse=True)
    # Find bounding box and extract ROI
    x, y, w, h = cv2.boundingRect(cnts[0])
    cropped_image = image[y:y+h, x:x+w]
    # cv2.imshow("cropped_image",cropped_image)
    return cnts[0]


def generate_crops():
    img_2 = cv2.imread('adjusted_image.jpg')
    # Cropping an image
    cropped_image_photo = img_2[80:480, 20:400]
    cropped_image_fitst_name = img_2[200:370, 600:]
    cropped_image_last_name = img_2[280:380, 600:]
    cropped_image_id = img_2[600:-100, 500:]
    # Display cropped image
    cv2.imwrite("cropped_image_photo.jpg", cropped_image_photo)
    cv2.imwrite("cropped_image_fitst_name.jpg", cropped_image_fitst_name)
    cv2.imwrite("cropped_image_last_name.jpg", cropped_image_last_name)
    cv2.imwrite("cropped_image_id.jpg", cropped_image_id)


def preprocess(image_path):
    image = cv2.imread(image_path)
    grayImage = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    (thresh, blackAndWhiteImage) = cv2.threshold(
        grayImage, 0, 255, cv2.THRESH_OTSU)
    return blackAndWhiteImage


def turnToEnglish(arabic_numbers):
    return convert_numbers.arabic_to_english(arabic_numbers)


def deletePerson(id):
    existing_person = Person.query.filter(Person.id == id).one_or_none()

    if existing_person:
        db.session.delete(existing_person)
        db.session.commit()
        return make_response(f"{id} successfully deleted", 200)
    else:
        abort(404, f"Person with last name {id} not found")


def execute(image):
    decoded_img = b64decode(image['image_name'])
    img_file = open('decoded_img.jpg', 'wb')
    img_file.write(decoded_img)
    img_file.close()
    img_younan = cv2.imread("decoded_img.jpg")
    img_younan = cv2.imread(image['image_name'])
    img_younan = remove_white_background(img_younan)
    biggest_contour = crop_image(img_younan)
    borders = draw_contours(img_younan, biggest_contour)
    perspectiveTransform(img_younan, borders)
    transformed = cv2.imread('transformed_image.jpg')
    adjusted_image = getAveragePixQuarter(transformed)
    cv2.imwrite('adjusted_image.jpg', adjusted_image)
    generate_crops()
    firstName = preprocess('cropped_image_fitst_name.jpg')
    arabic_name = pytesseract.image_to_string(
        firstName, lang='ara', config=".")
    secondName = preprocess('cropped_image_last_name.jpg')
    arabic_second_name = pytesseract.image_to_string(
        secondName, lang='ara', config=".")
    # print(arabic_second_name)
    first_name = arabic_name.split()[0]
    second_name = arabic_name.split()[1:] if arabic_name.split()[
        1:] == [] else arabic_second_name.split()

    id = preprocess("cropped_image_id.jpg")

    arabic_numbers = pytesseract.image_to_string(
        id, lang='arabic_numbers', config=".")
    arabic_numbers = "".join(arabic_numbers.split(" "))

    # print(
    #     f"first_name: {first_name}, second_name: {' '.join(second_name)}, numbers: {arabic_numbers}")

    existing_person = Person.query.filter(
        Person.id_number == arabic_numbers).one_or_none()

    if existing_person is None:

        new_person = person_schema.load({"id_number": turnToEnglish(arabic_numbers),
                                         "fname": first_name,
                                         "lname": ' '.join(second_name),
                                         },
                                        session=db.session)
        db.session.add(new_person)
        db.session.commit()
        return person_schema.dump(new_person), 201
    else:
        abort(
            406, f"Person with the id {turnToEnglish(arabic_numbers)} already exists")


def read_first_name(first_name):
    return first_name


def read_all():
    people = Person.query.all()
    return people_schema.dump(people)
    # arabic_numbers_adjusted = []
    # for i in arabic_numbers[::-1]:
    #     if i != ' ':
    #         arabic_numbers_adjusted.append(i)
    # print(
    #     f"first_name: {first_name}, second_name: {' '.join(second_name)}, numbers: {arabic_numbers}")

    # return {"first_name": first_name, "second_name": ' '.join(second_name),
    #         "arabic_numbers": ''.join(arabic_numbers_adjusted)[::-1].strip()}

