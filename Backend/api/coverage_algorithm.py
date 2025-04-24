import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
import math
from .models import Room, ResultAlgorithm
import io
from django.core.files.base import ContentFile

def CoverageOptimizationAlgorithm(data: dict):

    VarMaxx = 100
    VarMaxy = 100
    Rc = int(data["Rc"])
    Rs = int(data["Rs"])
    N = int(data["number_node"])
    MaxIt = 1000
    nPop = 50
    url = Room.objects.get(room_id = data["room_id"]).image
    image = Image.open(url.path)
    image_resized = image.resize((VarMaxx+1, VarMaxy+1))
    image_L = image_resized.convert('L')
    Area1 = np.zeros((VarMaxx+1,VarMaxy+1))
    image_matrix = np.array(image_L)
    image_1 =  Image.open(url.path)
    threshold =245
    binary_matrix = np.where(image_matrix > threshold, 255, 0).astype(np.uint8)

    for i in range(VarMaxx+1):
        for j in range(VarMaxy+1):
            if binary_matrix[j,i] == 255:
                Area1[j,i] = 255
            else:
                Area1[j,i] = 1

    ban_position_list = np.argwhere(Area1 == 1)
    ban_position = [(x, y) for y, x in ban_position_list]

    def initialize_population():
        # sink_node = (VarMaxx/2, VarMaxy/2)
        initPop = []
        # initPop.append(sink_node)
        for i in range(0, N):
            check = True
            while check:
                if i == 0 :
                    xi = 100*np.random.rand()
                    yi = 100*np.random.rand()
                else:
                    xp, yp = initPop[np.random.randint(0,i)]
                    Rcom = Rc*np.random.rand()
                    xi = xp + 2*Rcom*np.random.rand()-Rcom
                    if np.random.rand() > 0.5:
                        yi = yp + math.sqrt(Rcom**2 -(xi-xp)**2)
                    else:
                        yi = yp - math.sqrt(Rcom**2 -(xi-xp)**2)
                xi = np.clip(xi, 0, VarMaxx)
                yi = np.clip(yi, 0, VarMaxy)
                xj = int(xi)
                yj = int(yi)
                xj_c = xj+1
                yj_c = yj+1
                xj_t = xj-1
                yj_t = yj-1
                xj_c = np.clip(xj_c, 0, VarMaxx)
                yj_c = np.clip(yj_c, 0, VarMaxy)
                xj_t = np.clip(xj_t, 0, VarMaxx)
                yj_t = np.clip(yj_t, 0, VarMaxy)
                if (Area1[yj,xj] == 255
                    and Area1[yj,xj_c] == 255
                    and Area1[yj,xj_t] == 255
                    and Area1[yj_c,xj] == 255
                    and Area1[yj_t,xj] == 255):
                    check = False
            initPop.append((xi, yi))
        return initPop

    def fitness_function(sensor_nodes):
        M = (VarMaxx+1)*(VarMaxy+1)
        Rss = Rs ** 2 
        matrix_c = np.zeros((VarMaxx+1, VarMaxy+1), dtype=int)  
        grid_x, grid_y = np.meshgrid(np.arange(VarMaxx+1), np.arange(VarMaxy+1), indexing='ij')
        for sensor in sensor_nodes:
            sensor_y, sensor_x = sensor
            distances = (grid_x - sensor_x) ** 2 + (grid_y - sensor_y) ** 2
            matrix_c[distances <= Rss] = 1
        for i in ban_position:
            matrix_c[i[1],i[0]] = 0 
        coverage_ratio = round(np.sum(matrix_c) / M, 4)
        return coverage_ratio

    def depth_first_search( u, adjacency_list, visited):
        visited[u]=True
        for i in range(len(adjacency_list[u])):
            if not visited[adjacency_list[u][i]]:
                depth_first_search(adjacency_list[u][i], adjacency_list, visited)

    def check_connectivity(sensor_nodes):
        N = len(sensor_nodes)
        adjacency_list = {i : [] for i in range(N)}
        visited = np.zeros( N, dtype=bool)
        Rcc = Rc**2
        for i in range(N):
            for j in range(N):
                if i != j :
                    distance = (sensor_nodes[i][0] - sensor_nodes[j][0])**2 + (sensor_nodes[i][1] - sensor_nodes[j][1])**2
                    if distance <= Rcc:
                        adjacency_list[i].append(j)
        number = 0 
        for i in range(N):
            if not visited[i]:
                number = number + 1
                depth_first_search( i, adjacency_list, visited)
        if number == 1:
            return True
        return False

    def foa_algorithm():
        population = [initialize_population() for i in range(nPop)]
        index_fitness = [fitness_function(population[i]) for i in range(nPop)]
        best_fitness = max(index_fitness)
        best_solution = population[index_fitness.index(best_fitness)]
        step = 30
        for iteration in range(MaxIt):
            
            for i in range(0, nPop):
                
                k = np.random.randint(1, N)
                solution = np.copy(population[i])
                solution[k][0] = solution[k][0] + (2*step*np.random.rand() - step)
                solution[k][1] = solution[k][1] + (2*step*np.random.rand() - step)
                solution[k][0] = np.clip(solution[k][0], 0, VarMaxx)
                solution[k][1] = np.clip(solution[k][1], 0, VarMaxy)
                xi = int(solution[k][0])
                yi = int(solution[k][1])
                xi_c = xi+1
                yi_c = yi+1
                xi_t = xi-1
                yi_t = yi-1
                xi_c = np.clip(xi_c, 0, VarMaxx)
                yi_c = np.clip(yi_c, 0, VarMaxy)
                xi_t = np.clip(xi_t, 0, VarMaxx)
                yi_t = np.clip(yi_t, 0, VarMaxy)
                if (Area1[yi,xi] == 255
                    and Area1[yi,xi_c] == 255 
                    and Area1[yi,xi_t] == 255
                    and Area1[yi_c,xi] == 255
                    and Area1[yi_t,xi] == 255):
                    
                    if check_connectivity(solution):
                        new_fitness = fitness_function(solution)
                        if new_fitness > index_fitness[i]:
                            index_fitness[i] = new_fitness
                            population[i] = solution

            max_individual = max(index_fitness)
            if max_individual > best_fitness:
                best_fitness = max_individual
                best_solution = population[index_fitness.index(max_individual)]
                population[:]= [best_solution]*nPop
        return best_solution, best_fitness

    small_radius=1

    def draw_circle(ax, center, radius, small_radius):
        # Đường bao  phủ của cảm biến
        outline_circle = plt.Circle(center, radius, fill=False, ec='black', lw=0.8, alpha=1)  
        ax.add_artist(outline_circle)
        
        # Phạm vi cảm biến
        large_circle = plt.Circle(center, radius, color='cyan', alpha=0.2)  
        ax.add_artist(large_circle)

        # Hình tròn nhỏ bên trong
        small_circle = plt.Circle(center, small_radius, fill=False, ec='red', lw=1, alpha=0.7)  
        ax.add_artist(small_circle)
        

    def plot_sensor(sensor_nodes, fitness):

        caculator = round((len(ban_position)/((VarMaxy+1)*(VarMaxx+1))),4)

        fig1, ax = plt.subplots(1, 1)
        ax.set_xlim(0, VarMaxx)
        ax.set_ylim(0, VarMaxy)
        ax.set_aspect('equal', adjustable='box')
        ax.set_xticks(np.arange(0, 101, 10))
        ax.set_yticks(np.arange(0, 101, 10))
        ax.grid(True, linewidth=0.5)
        ax.invert_yaxis()

        for i, node in enumerate(sensor_nodes):
            draw_circle(ax, node, Rs, small_radius)
        ax.imshow(image_1, extent=[0, VarMaxx, VarMaxy, 0])

        ax.set_title(f"Coverage percent: {round(fitness/(1-caculator),4) * 100:.2f} %")
        for i in range(len(sensor_nodes)):
            for j in range(i+1, len(sensor_nodes)):
                node1, node2 = sensor_nodes[i], sensor_nodes[j]
                distance = np.linalg.norm(np.array(node1) - np.array(node2))
                if distance <= Rc:
                    ax.plot([node1[0], node2[0]], [node1[1], node2[1]], 'b-', linewidth=1)
        buffer1 = io.BytesIO()
        fig1.savefig(buffer1, format='PNG', bbox_inches='tight')
        buffer1.seek(0)

        fig2, ay = plt.subplots(1, 1)
        ay.set_xlim(0, VarMaxx)
        ay.set_ylim(0, VarMaxy)
        ay.set_aspect('equal', adjustable='box')
        ay.set_xticks(np.arange(0, 101, 10))
        ay.set_yticks(np.arange(0, 101, 10))
        ay.grid(True, linewidth=0.5)
        ay.invert_yaxis()

        for i, node in enumerate(sensor_nodes):
            draw_circle(ay, node, Rs, small_radius)
        for bp in ban_position:
            ay.plot(bp[0], bp[1], 'ko')

        ay.set_title(f"Coverage percent: {round(fitness/(1-caculator),4) * 100:.2f} %")
        for i in range(len(sensor_nodes)):
            for j in range(i+1, len(sensor_nodes)):
                node1, node2 = sensor_nodes[i], sensor_nodes[j]
                distance = np.linalg.norm(np.array(node1) - np.array(node2))
                if distance <= Rc:
                    ay.plot([node1[0], node2[0]], [node1[1], node2[1]], 'b-', linewidth=1)
        buffer2 = io.BytesIO()
        fig2.savefig(buffer2, format='PNG', bbox_inches='tight')
        buffer2.seek(0)

        result = ResultAlgorithm()
        result.room_id = Room.objects.get(room_id=data["room_id"])
        result.image_encode.save(f"coverage_encode_room{data['room_id']}.png", ContentFile(buffer2.read()), save=False)
        result.image_decode.save(f"coverage_decode_room{data['room_id']}.png", ContentFile(buffer1.read()), save=False)
        result.save()

        plt.close(fig1)
        plt.close(fig2)

    best_solution, best_fitness = foa_algorithm()
    plot_sensor(best_solution, best_fitness)
    print(best_solution, best_fitness)

if __name__ == '__main__':
    CoverageOptimizationAlgorithm({
        "room_id" : 407,
        "Rc":20,
        "Rs":20,
        "number_node": 10,
    })